import { Logger } from "./logger.js";
import type { LoggerOptions } from "./type.js";

export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options);
}

export { Logger };

export type { LogLevel, LogMetadata, LogPayload, LoggerOptions } from "./type.js";
