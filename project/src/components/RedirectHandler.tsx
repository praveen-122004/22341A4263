import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Button, Paper } from '@mui/material';
import { Launch, Error, Schedule } from '@mui/icons-material';
import { storageService } from '../services/storage';
import { logger } from '../services/logger';

export const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short URL');
      setIsRedirecting(false);
      return;
    }

    handleRedirect(shortCode);
  }, [shortCode]);

  useEffect(() => {
    if (isRedirecting && originalUrl && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          window.location.href = originalUrl;
        } else {
          setCountdown(countdown - 1);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown, isRedirecting, originalUrl]);

  const handleRedirect = async (code: string) => {
    try {
      logger.info('Processing redirect request', { shortCode: code });
      
      const shortUrl = storageService.getUrlByShortCode(code);
      
      if (!shortUrl) {
        logger.warn('Short URL not found or expired', { shortCode: code });
        setError('Short URL not found or has expired');
        setIsRedirecting(false);
        return;
      }

      // Record the click
      const source = document.referrer || 'direct';
      const userAgent = navigator.userAgent;
      
      storageService.recordClick(code, source, userAgent);
      
      setOriginalUrl(shortUrl.originalUrl);
      logger.info('Redirect successful, starting countdown', { 
        shortCode: code, 
        originalUrl: shortUrl.originalUrl 
      });

    } catch (err) {
      logger.error('Redirect failed', { shortCode: code, error: err });
      setError('Failed to process redirect');
      setIsRedirecting(false);
    }
  };

  const handleManualRedirect = () => {
    if (originalUrl) {
      window.location.href = originalUrl;
    }
  };

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="error">
            Redirect Failed
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/'} 
            sx={{ mr: 2 }}
          >
            Go Home
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.href = '/statistics'}
          >
            View Statistics
          </Button>
        </Paper>
      </Container>
    );
  }

  if (isRedirecting) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <CircularProgress size={60} />
          </Box>
          
          <Typography variant="h5" gutterBottom>
            Redirecting...
          </Typography>
          
          {originalUrl && (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                You will be redirected to:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  wordBreak: 'break-all', 
                  backgroundColor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1,
                  mb: 3
                }}
              >
                {originalUrl}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Schedule />
                <Typography variant="body1">
                  Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<Launch />}
                onClick={handleManualRedirect}
                size="large"
              >
                Go Now
              </Button>
            </>
          )}
        </Paper>
      </Container>
    );
  }

  return null;
};