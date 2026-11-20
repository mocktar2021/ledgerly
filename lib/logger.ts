// Structured logging (Chapter 46). Every entry carries a timestamp, level,
// message, and context; never raw secrets, tokens, or full payment
// details (see Chapter 46's "what never belongs in a log" rule).

type LogContext = Record<string, string | number | boolean | undefined>;

function write(level: "info" | "warn" | "error", message: string, context: LogContext = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  // In production this ships to a log aggregation service. Locally, plain
  // stdout is enough; the shape of the entry is what matters, not where
  // it goes.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

export const logger = {
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
};

// Generates a per-request ID to thread through every log line produced
// while handling one request, so they can be pulled back together later
// (Chapter 46, Chapter 49).
export function newRequestId(): string {
  return crypto.randomUUID();
}
