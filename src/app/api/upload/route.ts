import { type NextRequest } from "next/server";
import {
  apiResponse,
  apiError,
  catchApiError,
  ApiRouteError,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { MAX_DOCUMENT_SIZE_MB } from "@/constants";
import type { UploadResult, InputSourceType } from "@/types";

const MAX_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

const MIME_TO_SOURCE_TYPE: Record<string, InputSourceType> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "docx",
};

export async function POST(req: NextRequest) {
  return catchApiError(async () => {
    await requireAuth();
    const requestId = `upl_${Date.now()}`;
    logger.info("upload: request received", { requestId });

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return apiError("BAD_REQUEST", "No se pudo leer el formulario. Envía el archivo como multipart/form-data");
    }

    const fileEntry = formData.get("file");
    if (!fileEntry || !(fileEntry instanceof Blob)) {
      return apiError("BAD_REQUEST", "El campo 'file' es requerido y debe ser un archivo");
    }

    const file = fileEntry as File;
    const fileName = file.name ?? "archivo";
    const mimeType = file.type ?? "";
    const sizeBytes = file.size;

    logger.info("upload: file received", { requestId, fileName, mimeType, sizeBytes });

    const sourceType = MIME_TO_SOURCE_TYPE[mimeType];
    if (!sourceType) {
      logger.warn("upload: unsupported mime type", { requestId, mimeType });
      return apiError(
        "UNPROCESSABLE",
        `Tipo de archivo no soportado: ${mimeType || "desconocido"}. Sube un PDF, DOCX o TXT.`
      );
    }

    if (sizeBytes > MAX_SIZE_BYTES) {
      logger.warn("upload: file too large", { requestId, sizeBytes, limitBytes: MAX_SIZE_BYTES });
      return apiError(
        "UNPROCESSABLE",
        `El archivo supera el límite de ${MAX_DOCUMENT_SIZE_MB} MB. Tamaño actual: ${(sizeBytes / 1024 / 1024).toFixed(1)} MB`
      );
    }

    const endTimer = logger.time("upload: text extraction", { requestId, sourceType });
    let result: UploadResult;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      switch (sourceType) {
        case "pdf":
          result = await extractFromPDF(buffer, fileName, sizeBytes);
          break;
        case "docx":
          result = await extractFromDOCX(buffer, fileName, sizeBytes);
          break;
        case "txt":
          result = extractFromTXT(buffer, fileName, sizeBytes);
          break;
        default:
          throw new ApiRouteError("UNPROCESSABLE", `Tipo no manejado: ${sourceType}`);
      }
    } catch (err) {
      endTimer();
      if (err instanceof ApiRouteError) throw err;
      logger.error("upload: extraction failed", {
        requestId,
        sourceType,
        error: err instanceof Error ? err.message : String(err),
      });
      return apiError(
        "UNPROCESSABLE",
        "No se pudo extraer el texto del archivo. Verifica que no esté corrupto o protegido con contraseña."
      );
    }

    endTimer();

    if (result.text.trim().length < 20) {
      logger.warn("upload: extracted text too short", { requestId, charCount: result.text.length });
      return apiError(
        "UNPROCESSABLE",
        "El archivo no contiene suficiente texto para generar un prompt. Mínimo 20 caracteres."
      );
    }

    logger.info("upload: success", {
      requestId,
      sourceType,
      wordCount: result.metadata.wordCount,
      charCount: result.metadata.charCount,
      pages: result.metadata.pages,
    });

    return apiResponse(result);
  });
}

async function extractFromPDF(
  buffer: Buffer,
  fileName: string,
  sizeBytes: number
): Promise<UploadResult> {
  const pdfParse = (await import("pdf-parse")).default;
  const parsed = await pdfParse(buffer);
  const text = parsed.text ?? "";
  const wordCount = countWords(text);

  return {
    text,
    metadata: {
      fileType: "pdf",
      fileName,
      fileSizeBytes: sizeBytes,
      pages: parsed.numpages,
      wordCount,
      charCount: text.length,
    },
  };
}

async function extractFromDOCX(
  buffer: Buffer,
  fileName: string,
  sizeBytes: number
): Promise<UploadResult> {
  const mammoth = (await import("mammoth")).default;
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value ?? "";
  const wordCount = countWords(text);

  return {
    text,
    metadata: {
      fileType: "docx",
      fileName,
      fileSizeBytes: sizeBytes,
      wordCount,
      charCount: text.length,
    },
  };
}

function extractFromTXT(
  buffer: Buffer,
  fileName: string,
  sizeBytes: number
): UploadResult {
  const text = buffer.toString("utf-8");
  const wordCount = countWords(text);

  return {
    text,
    metadata: {
      fileType: "txt",
      fileName,
      fileSizeBytes: sizeBytes,
      wordCount,
      charCount: text.length,
    },
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
