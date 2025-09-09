import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import { ContentCopy, Launch, Schedule } from '@mui/icons-material';
import { ShortUrl } from '../types';
import { logger } from '../services/logger';

interface UrlResultsProps {
  urls: ShortUrl[];
  onClear: () => void;
}

export const UrlResults: React.FC<UrlResultsProps> = ({ urls, onClear }) => {
  const copyToClipboard = async (text: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('Short URL copied to clipboard', { shortCode, url: text });
      // You could add a toast notification here
    } catch (error) {
      logger.error('Failed to copy to clipboard', { error });
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        logger.info('Short URL copied to clipboard (fallback)', { shortCode });
      } catch (fallbackError) {
        logger.error('Fallback copy failed', { fallbackError });
      }
      document.body.removeChild(textArea);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getShortUrl = (shortCode: string): string => {
    return `${window.location.origin}/${shortCode}`;
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Expired';
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`;
    } else {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} remaining`;
    }
  };

  if (urls.length === 0) {
    return null;
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Your Short URLs
          </Typography>
          <Button variant="outlined" onClick={onClear} size="small">
            Clear Results
          </Button>
        </Box>

        <Alert severity="success" sx={{ mb: 2 }}>
          Successfully created {urls.length} short URL{urls.length > 1 ? 's' : ''}!
        </Alert>

        <Grid container spacing={2}>
          {urls.map((url) => {
            const shortUrl = getShortUrl(url.shortCode);
            const timeRemaining = getTimeRemaining(url.expiresAt);
            const isExpired = new Date() > url.expiresAt;

            return (
              <Grid item xs={12} key={url.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    backgroundColor: isExpired ? 'grey.50' : 'background.paper',
                    opacity: isExpired ? 0.7 : 1
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Original URL
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: 'break-all',
                          mb: 1
                        }}
                      >
                        {url.originalUrl}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Short URL
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body1" 
                          color="primary"
                          sx={{ fontFamily: 'monospace' }}
                        >
                          {shortUrl}
                        </Typography>
                        <Tooltip title="Copy to clipboard">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(shortUrl, url.shortCode)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open in new tab">
                          <IconButton
                            size="small"
                            component="a"
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip
                          icon={<Schedule />}
                          label={timeRemaining}
                          color={isExpired ? 'error' : 'success'}
                          size="small"
                        />
                        
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(url.createdAt)}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          Expires: {formatDate(url.expiresAt)}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          Clicks: {url.clickCount}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};