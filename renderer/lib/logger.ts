/**
 * Logger-Service für refined-echo
 * 
 * Zentrale Logging-Funktion mit Log-Levels.
 * In Production werden nur warn und error Logs ausgegeben.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  prefix?: string
  isDev?: boolean
}

class Logger {
  private prefix: string
  private isDev: boolean

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix ?? ''
    // Electron: process.env.NODE_ENV, Browser: check for localhost
    this.isDev = options.isDev ?? 
      (typeof process !== 'undefined' 
        ? process.env.NODE_ENV !== 'production'
        : window.location?.hostname === 'localhost')
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): [string, ...unknown[]] {
    const prefix = this.prefix ? `[${this.prefix}] ` : ''
    return [`${prefix}${message}`, ...args]
  }

  /**
   * Debug-Level: Nur in Development sichtbar
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      console.log(...this.formatMessage('debug', message, ...args))
    }
  }

  /**
   * Info-Level: Nur in Development sichtbar
   */
  info(message: string, ...args: unknown[]): void {
    if (this.isDev) {
      console.log(...this.formatMessage('info', message, ...args))
    }
  }

  /**
   * Warn-Level: Immer sichtbar
   */
  warn(message: string, ...args: unknown[]): void {
    console.warn(...this.formatMessage('warn', message, ...args))
  }

  /**
   * Error-Level: Immer sichtbar
   */
  error(message: string, ...args: unknown[]): void {
    console.error(...this.formatMessage('error', message, ...args))
  }
}

// Singleton-Instanz für die App
export const logger = new Logger()

// Factory für Modul-spezifische Logger mit Prefix
export function createLogger(prefix: string): Logger {
  return new Logger({ prefix })
}

export default logger
