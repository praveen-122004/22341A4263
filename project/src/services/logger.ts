import { LogEntry } from '../types';

class Logger {
  private logs: LogEntry[] = [];

  private log(level: LogEntry['level'], message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context
    };
    
    this.logs.push(entry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift();
    }

    // Console output for development
    const logMessage = `[${entry.timestamp.toISOString()}] ${level.toUpperCase()}: ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, context);
        break;
      case 'warn':
        console.warn(logMessage, context);
        break;
      case 'debug':
        console.debug(logMessage, context);
        break;
      default:
        console.info(logMessage, context);
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const logger = new Logger();