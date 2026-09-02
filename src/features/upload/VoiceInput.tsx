"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2, AlertCircle, RotateCcw, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Language, VoiceInputState } from "@/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface VoiceInputProps {
  language: Language;
  onResult: (text: string) => void;
  onStateChange?: (state: VoiceInputState) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// ─── Web Speech API types ─────────────────────────────────────────────────────

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function VoiceInput({ language, onResult, onStateChange }: VoiceInputProps) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [voiceState, setVoiceState] = useState<VoiceInputState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  // ── Inicializar SpeechRecognition ────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "es" ? "es-ES" : "en-US";

    recognition.onstart = () => {
      setVoiceState("listening");
      onStateChange?.("listening");
      // Iniciar timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const text = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        setTranscript((prev) => {
          const newTranscript = prev ? `${prev} ${finalText}`.trim() : finalText;
          return newTranscript;
        });
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        // No hacer nada — el recognition se reinicia solo via onend
        return;
      }
      if (event.error === "aborted") {
        // Abortado manualmente, ignore
        return;
      }

      const messages: Record<string, string> = {
        "audio-capture": "No se detectó micrófono. Verifica los permisos.",
        "not-allowed": "Permiso de micrófono denegado. Habilita el acceso en tu navegador.",
        "network": "Error de red. Verifica tu conexión.",
        "service-not-allowed": "El servicio de reconocimiento no está disponible.",
      };
      const message = messages[event.error] || `Error: ${event.error}`;
      setError(message);
      setVoiceState("error");
      onStateChange?.("error");
    };

    recognition.onend = () => {
      // Si still in listening state, restart (loop continuo)
      if (recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          // Ya está started, ignorar
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.onstart = null;
      recognition.abort();
      recognitionRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [language, onStateChange]);

  // ── Actualizar lang cuando cambia el config ──────────────────────────────
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "es" ? "es-ES" : "en-US";
    }
  }, [language]);

  // ── Cleanup timer al desmontar ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // ── Start/Stop ───────────────────────────────────────────────────────────
  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (voiceState === "listening") {
      // Detener
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setVoiceState("idle");
      onStateChange?.("idle");

      // Combinar transcript final con interim
      const fullText = transcript ? `${transcript} ${interimTranscript}`.trim() : interimTranscript;
      if (fullText) {
        setTranscript(fullText);
        setInterimTranscript("");
        setEditedText(fullText);
      }
    } else {
      // Iniciar
      setError(null);
      setTranscript("");
      setInterimTranscript("");
      setDuration(0);
      setIsEditing(false);

      // Re-crear recognition para limpiar estado previo
      const SpeechRecognition = getSpeechRecognition();
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === "es" ? "es-ES" : "en-US";

      recognition.onstart = () => {
        setVoiceState("listening");
        onStateChange?.("listening");
        setDuration(0);
        timerRef.current = setInterval(() => {
          setDuration((d) => d + 1);
        }, 1000);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result) continue;
          const text = result[0]?.transcript ?? "";

          if (result.isFinal) {
            finalText += text;
          } else {
            interimText += text;
          }
        }

        if (finalText) {
          setTranscript((prev) => {
            const newTranscript = prev ? `${prev} ${finalText}`.trim() : finalText;
            return newTranscript;
          });
        }
        setInterimTranscript(interimText);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "no-speech" || event.error === "aborted") return;

        const messages: Record<string, string> = {
          "audio-capture": "No se detectó micrófono. Verifica los permisos.",
          "not-allowed": "Permiso de micrófono denegado. Habilita el acceso en tu navegador.",
          "network": "Error de red. Verifica tu conexión.",
          "service-not-allowed": "El servicio de reconocimiento no está disponible.",
        };
        const message = messages[event.error] || `Error: ${event.error}`;
        setError(message);
        setVoiceState("error");
        onStateChange?.("error");
      };

      recognition.onend = () => {
        if (recognitionRef.current) {
          try {
            recognition.start();
          } catch {
            // Ya está started
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  }, [voiceState, transcript, interimTranscript, language, onStateChange]);

  // ── Confirmar texto editado ──────────────────────────────────────────────
  const handleConfirmEdit = () => {
    setTranscript(editedText);
    setIsEditing(false);
    onResult(editedText);
  };

  // ── Confirmar texto final ────────────────────────────────────────────────
  const handleConfirm = () => {
    const finalText = transcript || interimTranscript;
    if (finalText) {
      onResult(finalText);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setTranscript("");
    setInterimTranscript("");
    setDuration(0);
    setIsEditing(false);
    setEditedText("");
    setError(null);
    setVoiceState("idle");
    onStateChange?.("idle");
  };

  // ── No soportado ─────────────────────────────────────────────────────────
  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
          <MicOff className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">
            Tu navegador no soporta entrada por voz
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Usa Chrome o Edge para usar el micrófono
          </p>
        </div>
      </div>
    );
  }

  // ── Texto transcrito (post-grabación o editando) ──────────────────────────
  const hasTranscript = transcript || interimTranscript;

  if (hasTranscript && voiceState === "idle") {
    return (
      <div className="space-y-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full min-h-[80px] max-h-[160px] rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              placeholder="Edita tu texto transcrito..."
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirmEdit}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
              >
                <Check className="h-3.5 w-3.5" />
                Confirmar
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(transcript);
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-600"
              >
                <Check className="h-3.5 w-3.5" />
                Usar texto
              </button>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedText(transcript);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Borrar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Vista principal ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Botón de micrófono */}
      <button
        onClick={toggleRecording}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-200",
          voiceState === "listening"
            ? "border-brand-500/50 bg-brand-500/20 text-brand-400 animate-pulse-glow"
            : voiceState === "error"
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-border bg-muted/40 text-muted-foreground hover:border-brand-500/30 hover:bg-muted/60 hover:text-foreground"
        )}
        aria-label={voiceState === "listening" ? "Detener grabación" : "Empezar a hablar"}
      >
        {voiceState === "listening" ? (
          <Mic className="h-6 w-6" />
        ) : voiceState === "error" ? (
          <AlertCircle className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}

        {/* Ring pulsante cuando graba */}
        {voiceState === "listening" && (
          <span className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-ping" />
        )}
      </button>

      {/* Estado y duración */}
      <div className="text-center">
        {voiceState === "listening" && (
          <>
            <p className="text-xs font-medium text-brand-400">Escuchando...</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {formatDuration(duration)}
            </p>
          </>
        )}
        {voiceState === "error" && error && (
          <p className="text-[11px] text-destructive max-w-[200px]">{error}</p>
        )}
        {voiceState === "idle" && !hasTranscript && (
          <p className="text-[11px] text-muted-foreground">
            Haz click para empezar a hablar
          </p>
        )}
      </div>

      {/* Transcripción en tiempo real */}
      {voiceState === "listening" && interimTranscript && (
        <div className="w-full rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            {interimTranscript}
          </p>
        </div>
      )}
    </div>
  );
}
