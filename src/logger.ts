import type {
  LoggerOptions,
  LogLevel,
  LogMetadata,
  LogPayload,
} from "./type.js";

export class Logger {
  private readonly service: string;
  private readonly endpoint: string;

  constructor(options: LoggerOptions) {
    this.service = options.service;
    this.endpoint = options.endpoint.replace(/\/$/, "");
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
      // request_id,
      ...(request_id !== undefined && { request_id }),
      metadata,
    };

    try {
      const response = await fetch(`${this.endpoint}/v1/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(
          `Platypus logging failed: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      // Logging should never crash the application.
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
