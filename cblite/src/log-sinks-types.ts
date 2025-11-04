
import { LogLevel, LogDomain } from './log-sinks-enums';
 

/**
 * Configuration for console log sink
 */
export interface ConsoleLogSinkConfig {
  /** The minimum log level to log */
  level: LogLevel;
  
  /** The log domains to log. Defaults to all domains if not specified. */
  domains?: LogDomain[];
}

/**
 * Configuration for file log sink
 */
export interface FileLogSinkConfig {
  /** The minimum log level to log */
  level: LogLevel;
  
  /** The directory where log files will be stored */
  directory: string;
  
  /** Use plaintext format instead of binary. Defaults to false. */
  usePlaintext?: boolean;
  
  /** Maximum size of a log file in bytes. Defaults to 524288 (512KB). */
  maxFileSize?: number;
  
  /** Maximum number of rotated log files to keep. Defaults to 2. */
  maxKeptFiles?: number;
}

/**
 * Configuration for custom log sink with callback
 */
export interface CustomLogSinkConfig {
  /** The minimum log level to log */
  level: LogLevel;
  
  /** The log domains to log. Defaults to all domains if not specified. */
  domains?: LogDomain[];
  
  /** Callback function that receives log messages */
  callback: (level: LogLevel, domain: LogDomain, message: string) => void;
}


/**
 * Arguments for setting console log sink (internal bridge use)
 */
export interface LogSinksSetConsoleArgs {
  level: number | null;
  domains: string[] | null;
}

/**
 * Arguments for setting file log sink (internal bridge use)
 */
export interface LogSinksSetFileArgs {
  level: number | null;
  config: {
    directory: string;
    usePlaintext?: boolean;
    maxFileSize?: number;
    maxKeptFiles?: number;
  } | null;
}

/**
 * Arguments for setting custom log sink (internal bridge use)
 */
export interface LogSinksSetCustomArgs {
  level: number | null;
  domains: string[] | null;
  token: string | null;
}