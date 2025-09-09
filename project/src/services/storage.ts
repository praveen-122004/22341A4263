import { ShortUrl, ClickData } from '../types';
import { logger } from './logger';

const STORAGE_KEY = 'urlShortener_data';

export class StorageService {
  private data: ShortUrl[] = [];

  constructor() {
    this.loadData();
    logger.info('StorageService initialized');
  }

  private loadData(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          expiresAt: new Date(item.expiresAt),
          clicks: item.clicks.map((click: any) => ({
            ...click,
            timestamp: new Date(click.timestamp)
          }))
        }));
        logger.info(`Loaded ${this.data.length} URLs from storage`);
      }
    } catch (error) {
      logger.error('Failed to load data from storage', { error });
      this.data = [];
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      logger.info('Data saved to storage');
    } catch (error) {
      logger.error('Failed to save data to storage', { error });
    }
  }

  getAllUrls(): ShortUrl[] {
    // Filter out expired URLs
    const now = new Date();
    const activeUrls = this.data.filter(url => url.expiresAt > now);
    
    if (activeUrls.length !== this.data.length) {
      this.data = activeUrls;
      this.saveData();
      logger.info(`Cleaned up ${this.data.length - activeUrls.length} expired URLs`);
    }
    
    return [...this.data];
  }

  getUrlByShortCode(shortCode: string): ShortUrl | undefined {
    const url = this.data.find(u => u.shortCode === shortCode);
    if (url && url.expiresAt <= new Date()) {
      logger.warn('Attempted to access expired URL', { shortCode });
      return undefined;
    }
    return url;
  }

  createUrl(originalUrl: string, validityMinutes: number, customShortcode?: string): ShortUrl {
    const shortCode = customShortcode || this.generateShortCode();
    
    if (this.data.some(u => u.shortCode === shortCode)) {
      throw new Error('Shortcode already exists');
    }

    const now = new Date();
    const newUrl: ShortUrl = {
      id: crypto.randomUUID(),
      originalUrl,
      shortCode,
      createdAt: now,
      expiresAt: new Date(now.getTime() + validityMinutes * 60000),
      clickCount: 0,
      clicks: []
    };

    this.data.push(newUrl);
    this.saveData();
    
    logger.info('Created new short URL', { 
      shortCode, 
      originalUrl, 
      validityMinutes 
    });
    
    return newUrl;
  }

  recordClick(shortCode: string, source: string, userAgent: string): boolean {
    const url = this.getUrlByShortCode(shortCode);
    if (!url) {
      logger.warn('Click recorded for non-existent URL', { shortCode });
      return false;
    }

    const clickData: ClickData = {
      timestamp: new Date(),
      source: source || 'direct',
      location: this.getApproximateLocation(),
      userAgent: userAgent || 'unknown'
    };

    url.clicks.push(clickData);
    url.clickCount++;
    this.saveData();

    logger.info('Click recorded', { 
      shortCode, 
      clickCount: url.clickCount,
      source 
    });
    
    return true;
  }

  private generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (this.data.some(u => u.shortCode === result)) {
      return this.generateShortCode();
    }
    
    return result;
  }

  private getApproximateLocation(): string {
    // Simulate coarse-grained location based on timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locationMap: Record<string, string> = {
      'America/New_York': 'New York, US',
      'America/Los_Angeles': 'California, US',
      'America/Chicago': 'Chicago, US',
      'Europe/London': 'London, UK',
      'Europe/Paris': 'Paris, FR',
      'Asia/Tokyo': 'Tokyo, JP',
      'Asia/Shanghai': 'Shanghai, CN',
      'Australia/Sydney': 'Sydney, AU'
    };
    
    return locationMap[timezone] || `Unknown (${timezone})`;
  }

  isShortCodeAvailable(shortCode: string): boolean {
    return !this.data.some(u => u.shortCode === shortCode);
  }
}

export const storageService = new StorageService();