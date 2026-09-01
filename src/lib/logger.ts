type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

function formatContext(ctx?: Record<string, unknown>): string {
  if (!ctx || Object.keys(ctx).length === 0) return "";
  return " " + JSON.stringify(ctx);
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = { level, message, context, timestamp: new Date().toISOString() };
  const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
  const full = `${prefix} ${message}${formatContext(context)}`;
  switch (level) {
    case "error": console.error(full); break;
    case "warn":  console.warn(full);  break;
    case "debug":
      if (process.env.NODE_ENV === "development") console.debug(full);
      break;
    default: console.log(full);
  }
}

export const logger = {
  info:  (msg: string, ctx?: Record<string, unknown>) => log("info",  msg, ctx),
  warn:  (msg: string, ctx?: Record<string, unknown>) => log("warn",  msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),

  time: (operationName: string, ctx?: Record<string, unknown>): (() => void) => {
    const start = Date.now();
    log("info", `→ ${operationName} started`, ctx);
    return () => {
      const ms = Date.now() - start;
      log("info", `✓ ${operationName} completed`, { ...ctx, durationMs: ms });
    };
  },
};
