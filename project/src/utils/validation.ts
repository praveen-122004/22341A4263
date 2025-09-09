import { logger } from '../services/logger';

export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  try {
    if (!url || url.trim().length === 0) {
      return { isValid: false, error: 'URL is required' };
    }

    // Add protocol if missing
    let processedUrl = url.trim();
    if (!processedUrl.match(/^https?:\/\//)) {
      processedUrl = `https://${processedUrl}`;
    }

    const urlObj = new URL(processedUrl);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Check for localhost conflicts
    if (urlObj.hostname === 'localhost' && urlObj.port === '3000') {
      return { isValid: false, error: 'Cannot shorten localhost:3000 URLs to prevent conflicts' };
    }

    logger.debug('URL validation passed', { originalUrl: url, processedUrl });
    return { isValid: true };
  } catch (error) {
    logger.error('URL validation failed', { url, error });
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const validateShortcode = (shortcode: string): { isValid: boolean; error?: string } => {
  if (!shortcode) {
    return { isValid: true }; // Optional field
  }

  if (shortcode.length < 3 || shortcode.length > 20) {
    return { isValid: false, error: 'Shortcode must be between 3 and 20 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(shortcode)) {
    return { isValid: false, error: 'Shortcode can only contain letters, numbers, hyphens, and underscores' };
  }

  logger.debug('Shortcode validation passed', { shortcode });
  return { isValid: true };
};

export const validateValidityMinutes = (minutes: string): { isValid: boolean; error?: string; value?: number } => {
  if (!minutes || minutes.trim() === '') {
    return { isValid: true, value: 30 }; // Default value
  }

  const num = parseInt(minutes.trim(), 10);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Validity must be a valid number' };
  }

  if (num < 1) {
    return { isValid: false, error: 'Validity must be at least 1 minute' };
  }

  if (num > 525600) { // 1 year in minutes
    return { isValid: false, error: 'Validity cannot exceed 1 year (525,600 minutes)' };
  }

  logger.debug('Validity validation passed', { minutes: num });
  return { isValid: true, value: num };
};

export const normalizeUrl = (url: string): string => {
  let processedUrl = url.trim();
  if (!processedUrl.match(/^https?:\/\//)) {
    processedUrl = `https://${processedUrl}`;
  }
  return processedUrl;
};