import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
  Collapse,
  Tooltip
} from '@mui/material';
import { 
  Analytics, 
  ExpandMore, 
  ExpandLess, 
  Schedule,
  Mouse,
  LocationOn,
  Computer,
  Launch,
  ContentCopy
} from '@mui/icons-material';
import { storageService } from '../services/storage';
import { ShortUrl } from '../types';
import { logger } from '../services/logger';

export const StatisticsPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = () => {
    try {
      const allUrls = storageService.getAllUrls();
      setUrls(allUrls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      logger.info('Loaded URLs for statistics', { count: allUrls.length });
    } catch (error) {
      logger.error('Failed to load URLs for statistics', { error });
    }
  };

  const copyToClipboard = async (text: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('Short URL copied to clipboard from stats', { shortCode });
    } catch (error) {
      logger.error('Failed to copy to clipboard from stats', { error });
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

  const toggleExpanded = (urlId: string) => {
    setExpandedUrl(expandedUrl === urlId ? null : urlId);
  };

  const getTotalClicks = () => {
    return urls.reduce((total, url) => total + url.clickCount, 0);
  };

  const getActiveUrls = () => {
    const now = new Date();
    return urls.filter(url => url.expiresAt > now).length;
  };

  if (urls.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Analytics sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            URL Statistics
          </Typography>
        </Box>

        <Alert severity="info">
          No shortened URLs found. Create some URLs first to see statistics here.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Analytics sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          URL Statistics
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Link sx={{ fontSize: 24, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {urls.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total URLs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Schedule sx={{ fontSize: 24, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {getActiveUrls()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active URLs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Mouse sx={{ fontSize: 24, color: 'secondary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {getTotalClicks()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clicks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* URLs List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Shortened URLs
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {urls.map((url) => {
              const shortUrl = getShortUrl(url.shortCode);
              const timeRemaining = getTimeRemaining(url.expiresAt);
              const isExpired = new Date() > url.expiresAt;
              const isExpanded = expandedUrl === url.id;

              return (
                <Paper 
                  key={url.id} 
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
                        sx={{ wordBreak: 'break-all', mb: 1 }}
                      >
                        {url.originalUrl}
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

                    <Grid item xs={12} md={4}>
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
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {url.clickCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Clicks
                        </Typography>
                        {url.clicks.length > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => toggleExpanded(url.id)}
                            sx={{ mt: 1 }}
                          >
                            {isExpanded ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Click Details
                      </Typography>
                      
                      {url.clicks.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No clicks yet
                        </Typography>
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Source</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>User Agent</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {url.clicks.slice().reverse().map((click, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Schedule sx={{ fontSize: 16 }} />
                                      {formatDate(click.timestamp)}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={click.source} size="small" variant="outlined" />
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <LocationOn sx={{ fontSize: 16 }} />
                                      {click.location}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Computer sx={{ fontSize: 16 }} />
                                      <Typography variant="caption" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {click.userAgent}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};