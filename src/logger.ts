import type {
  LoggerOptions,
  LogLevel,
  LogMetadata,
  LogPayload,
} from "./type.js";

const DEFAULT_ENDPOINT =
  (typeof process !== "undefined" && process.env?.PLATYPUS_ENDPOINT) ||
  "https://platypus-server.onrender.com/api";

function normalizeLogsEndpoint(rawEndpoint?: string): string {
  const base = (rawEndpoint || DEFAULT_ENDPOINT).trim().replace(/\/+$/, "");

  if (base.endsWith("/v1/logs")) {
    return base;
  }
  if (base.endsWith("/v1")) {
    return `${base}/logs`;
  }
  if (base.endsWith("/api")) {
    return `${base}/v1/logs`;
  }
  return `${base}/api/v1/logs`;
}

export class Logger {
  private readonly service: string;
  private readonly logsUrl: string;
  private readonly apiKey: string;

  constructor(options: LoggerOptions) {
    this.service = options.service;
    this.logsUrl = normalizeLogsEndpoint(options.endpoint);
    this.apiKey =
      options.apiKey ||
      (typeof process !== "undefined" ? process.env?.PLATYPUS_API_KEY || "" : "");

    if (!this.apiKey) {
      console.warn(
        "Platypus Logger initialized without an apiKey. Log requests will fail authentication.",
      );
    }
  }

  private async send(
    level: LogLevel,
    message: string,
    request_id?: string,
    metadata: LogMetadata = {},
  ): Promise<void> {
    const payload: LogPayload = {
      service: this.service,
      level,
      message,
      ...(request_id !== undefined && { request_id }),
      metadata,
    };

    try {
      const response = await fetch(this.logsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(
          `Platypus logging failed: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error("Platypus logging service unavailable:", error);
    }
  }

  debug(
    message: string,
    request_id?: string,
    metadata?: LogMetadata,
  ): Promise<void> {
    return this.send("debug", message, request_id, metadata);
  }

  info(
    message: string,
    request_id?: string,
    metadata?: LogMetadata,
  ): Promise<void> {
    return this.send("info", message, request_id, metadata);
  }

  warn(
    message: string,
    request_id?: string,
    metadata?: LogMetadata,
  ): Promise<void> {
    return this.send("warn", message, request_id, metadata);
  }

  error(
    message: string,
    request_id?: string,
    metadata?: LogMetadata,
  ): Promise<void> {
    return this.send("error", message, request_id, metadata);
  }
}
