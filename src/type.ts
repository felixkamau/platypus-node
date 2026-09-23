export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMetadata = Record<string, unknown>;

export interface LoggerOptions {
  service: string;
  endpoint?: string;
  apiKey: string;
}

export interface LogPayload {
  service: string;
  level: LogLevel;
  message: string;
  request_id?: string;
  metadata: LogMetadata;
}
