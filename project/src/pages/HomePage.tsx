import React, { useState } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import { Link } from '@mui/icons-material';
import { UrlForm } from '../components/UrlForm';
import { UrlResults } from '../components/UrlResults';
import { ShortUrl } from '../types';

export const HomePage: React.FC = () => {
  const [recentUrls, setRecentUrls] = useState<ShortUrl[]>([]);

  const handleUrlsCreated = (urls: ShortUrl[]) => {
    setRecentUrls(urls);
  };

  const handleClearResults = () => {
    setRecentUrls([]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Link sx={{ fontSize: 40 }} />
          <Typography variant="h3" component="h1" fontWeight="bold">
            URL Shortener
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Transform long URLs into short, manageable links with detailed analytics
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <UrlForm onUrlsCreated={handleUrlsCreated} />
        
        {recentUrls.length > 0 && (
          <UrlResults 
            urls={recentUrls} 
            onClear={handleClearResults}
          />
        )}
      </Box>
    </Container>
  );
};