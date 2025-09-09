export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  expiresAt: Date;
  clickCount: number;
  clicks: ClickData[];
}

export interface ClickData {
  timestamp: Date;
  source: string;
  location: string;
  userAgent: string;
}

export interface CreateUrlRequest {
  originalUrl: string;
  validityMinutes?: number;
  customShortcode?: string;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}