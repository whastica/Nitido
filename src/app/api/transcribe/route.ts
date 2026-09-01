import { type NextRequest } from "next/server";
import OpenAI from "openai";
import {
  apiResponse,
  apiError,
  catchApiError,
  ApiRouteError,
} from "@/lib/api";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { MAX_AUDIO_SIZE_MB } from "@/constants";
import type { TranscriptionResult } from "@/types";

const MAX_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024;
const WHISPER_MAX_CHUNK_BYTES = 25 * 1024 * 1024;

const ACCEPTED_AUDIO_MIME: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "video/mp4": "mp4",
  "audio/webm": "webm",
};

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    if (!env.OPENAI_API_KEY) {
      throw new ApiRouteError(
        "AI_ERROR",
        "OPENAI_API_KEY no está configurada. Agrégala a .env.local."
      );
    }
    _client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return _client;
}

export async function POST(req: NextRequest) {
  return catchApiError(async () => {
    const { userId } = await requireAuth();
    const requestId = `trc_${Date.now()}`;
    logger.info("transcribe: request received", { requestId, userId });

    const rateLimit = await checkRateLimit(getClientIp(req));
    if (!rateLimit.allowed) {
      return apiError("RATE_LIMITED", `Demasiadas solicitudes. Intenta de nuevo en ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} segundos.`);
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return apiError("BAD_REQUEST", "No se pudo leer el formulario. Envía el archivo como multipart/form-data");
    }

    const fileEntry = formData.get("file");
    if (!fileEntry || !(fileEntry instanceof Blob)) {
      return apiError("BAD_REQUEST", "El campo 'file' es requerido y debe ser un archivo de audio");
    }

    const file = fileEntry as File;
    const fileName = file.name ?? "audio";
    const mimeType = file.type ?? "";
    const sizeBytes = file.size;

    logger.info("transcribe: file received", { requestId, userId, fileName, mimeType, sizeBytes });

    const format = ACCEPTED_AUDIO_MIME[mimeType];
    if (!format) {
      logger.warn("transcribe: unsupported mime type", { requestId, mimeType });
      return apiError(
        "UNPROCESSABLE",
        `Tipo de audio no soportado: ${mimeType || "desconocido"}. Sube MP3, MP4, M4A, WAV o WEBM.`
      );
    }

    if (sizeBytes > MAX_SIZE_BYTES) {
      logger.warn("transcribe: file too large", { requestId, sizeBytes, limitBytes: MAX_SIZE_BYTES });
      return apiError(
        "UNPROCESSABLE",
        `El archivo supera el límite de ${MAX_AUDIO_SIZE_MB} MB. Tamaño actual: ${(sizeBytes / 1024 / 1024).toFixed(1)} MB`
      );
    }

    const endTimer = logger.time("transcribe: whisper", { requestId, format });
    let result: TranscriptionResult;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length <= WHISPER_MAX_CHUNK_BYTES) {
        result = await transcribeChunk(buffer, fileName, mimeType);
      } else {
        result = await transcribeLargeFile(buffer, fileName, mimeType, requestId);
      }
    } catch (err) {
      endTimer();
      if (err instanceof ApiRouteError) throw err;
      logger.error("transcribe: whisper failed", {
        requestId,
        error: err instanceof Error ? err.message : String(err),
      });
      return apiError(
        "AI_ERROR",
        "No se pudo transcribir el audio. Verifica que no esté corrupto o que sea audio válido."
      );
    }

    endTimer();

    if (!result.text || result.text.trim().length < 10) {
      logger.warn("transcribe: text too short", { requestId, charCount: result.text?.length ?? 0 });
      return apiError(
        "UNPROCESSABLE",
        "El audio no contiene suficiente contenido hablado para transcribir. Mínimo 10 caracteres."
      );
    }

    logger.info("transcribe: success", {
      requestId,
      duration: result.duration,
      language: result.language,
      charCount: result.text.length,
    });

    return apiResponse(result);
  });
}

async function transcribeChunk(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<TranscriptionResult> {
  const client = getClient();
  const bytes = new Uint8Array(buffer);
  const file = new File([bytes], fileName, { type: mimeType });

  const response = await client.audio.transcriptions.create({
    model: "whisper-1",
    file,
    language: "es",
    response_format: "verbose_json",
  });

  return {
    text: response.text ?? "",
    duration: response.duration ?? 0,
    language: response.language ?? "es",
  };
}

async function transcribeLargeFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  requestId: string
): Promise<TranscriptionResult> {
  const totalChunks = Math.ceil(buffer.length / WHISPER_MAX_CHUNK_BYTES);
  logger.info("transcribe: chunking large file", {
    requestId,
    totalSizeMB: (buffer.length / 1024 / 1024).toFixed(1),
    totalChunks,
  });

  const chunks: string[] = [];
  let totalDuration = 0;
  let lastLanguage = "es";

  for (let i = 0; i < totalChunks; i++) {
    const start = i * WHISPER_MAX_CHUNK_BYTES;
    const end = Math.min(start + WHISPER_MAX_CHUNK_BYTES, buffer.length);
    const chunkBuffer = buffer.slice(start, end);

    logger.info("transcribe: processing chunk", {
      requestId, chunk: i + 1, totalChunks,
      sizeMB: (chunkBuffer.length / 1024 / 1024).toFixed(1),
    });

    const result = await transcribeChunk(chunkBuffer, `${fileName}_chunk${i + 1}`, mimeType);
    chunks.push(result.text);
    totalDuration += result.duration;
    lastLanguage = result.language;
  }

  return {
    text: chunks.join(" "),
    duration: totalDuration,
    language: lastLanguage,
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
