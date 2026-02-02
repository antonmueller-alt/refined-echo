/**
 * Logger für Main Process
 * 
 * Zentralisiertes Logging mit konfigurierbaren Log-Levels.
 * Im Production-Build werden nur warn und error geloggt.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  context: string
  minLevel?: LogLevel
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

const isDev = process.env.NODE_ENV !== 'production'

class Logger {
  private context: string
  private minLevel: number

  constructor(options: LoggerOptions) {
    this.context = options.context
    // In production nur warn und error, in dev alles
    this.minLevel = LOG_LEVELS[options.minLevel || (isDev ? 'debug' : 'warn')]
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): unknown[] {
    const timestamp = new Date().toISOString().substring(11, 23)
    return [`[${timestamp}] [${this.context}]`, message, ...args]
  }

  debug(message: string, ...args: unknown[]): void {
    if (LOG_LEVELS.debug >= this.minLevel) {
      console.log(...this.formatMessage('debug', message, ...args))
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (LOG_LEVELS.info >= this.minLevel) {
      console.log(...this.formatMessage('info', message, ...args))
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(...this.formatMessage('warn', message, ...args))
  }

  error(message: string, ...args: unknown[]): void {
    console.error(...this.formatMessage('error', message, ...args))
  }
}

export function createLogger(context: string, minLevel?: LogLevel): Logger {
  return new Logger({ context, minLevel })
}
