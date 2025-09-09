import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { CreateUrlRequest, ShortUrl } from '../types';
import { validateUrl, validateShortcode, validateValidityMinutes, normalizeUrl } from '../utils/validation';
import { storageService } from '../services/storage';
import { logger } from '../services/logger';

interface UrlFormProps {
  onUrlsCreated: (urls: ShortUrl[]) => void;
}

interface FormEntry {
  id: string;
  originalUrl: string;
  validityMinutes: string;
  customShortcode: string;
  errors: {
    originalUrl?: string;
    validityMinutes?: string;
    customShortcode?: string;
  };
}

export const UrlForm: React.FC<UrlFormProps> = ({ onUrlsCreated }) => {
  const [entries, setEntries] = useState<FormEntry[]>([
    { id: '1', originalUrl: '', validityMinutes: '', customShortcode: '', errors: {} }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const addEntry = () => {
    if (entries.length < 5) {
      setEntries(prev => [...prev, {
        id: Date.now().toString(),
        originalUrl: '',
        validityMinutes: '',
        customShortcode: '',
        errors: {}
      }]);
      logger.info('Added new URL entry form');
    }
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
      logger.info('Removed URL entry form', { entryId: id });
    }
  };

  const updateEntry = (id: string, field: keyof Omit<FormEntry, 'id' | 'errors'>, value: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, [field]: value, errors: { ...entry.errors, [field]: undefined } }
        : entry
    ));
    setGlobalError(null);
  };

  const validateEntry = (entry: FormEntry): boolean => {
    const errors: FormEntry['errors'] = {};
    let isValid = true;

    // Validate URL
    const urlValidation = validateUrl(entry.originalUrl);
    if (!urlValidation.isValid) {
      errors.originalUrl = urlValidation.error;
      isValid = false;
    }

    // Validate shortcode
    const shortcodeValidation = validateShortcode(entry.customShortcode);
    if (!shortcodeValidation.isValid) {
      errors.customShortcode = shortcodeValidation.error;
      isValid = false;
    } else if (entry.customShortcode && !storageService.isShortCodeAvailable(entry.customShortcode)) {
      errors.customShortcode = 'This shortcode is already taken';
      isValid = false;
    }

    // Validate validity
    const validityValidation = validateValidityMinutes(entry.validityMinutes);
    if (!validityValidation.isValid) {
      errors.validityMinutes = validityValidation.error;
      isValid = false;
    }

    setEntries(prev => prev.map(e => 
      e.id === entry.id ? { ...e, errors } : e
    ));

    return isValid;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      // Validate all entries
      const validEntries = entries.filter(entry => entry.originalUrl.trim());
      if (validEntries.length === 0) {
        setGlobalError('Please provide at least one URL to shorten');
        return;
      }

      let allValid = true;
      for (const entry of validEntries) {
        if (!validateEntry(entry)) {
          allValid = false;
        }
      }

      if (!allValid) {
        setGlobalError('Please fix the errors above before submitting');
        return;
      }

      // Check for duplicate shortcodes within the current batch
      const customShortcodes = validEntries
        .map(e => e.customShortcode)
        .filter(Boolean);
      const uniqueShortcodes = new Set(customShortcodes);
      
      if (customShortcodes.length !== uniqueShortcodes.size) {
        setGlobalError('Duplicate custom shortcodes are not allowed in the same batch');
        return;
      }

      // Create URLs
      const createdUrls: ShortUrl[] = [];
      for (const entry of validEntries) {
        const validityValidation = validateValidityMinutes(entry.validityMinutes);
        const normalizedUrl = normalizeUrl(entry.originalUrl);
        
        try {
          const shortUrl = storageService.createUrl(
            normalizedUrl,
            validityValidation.value || 30,
            entry.customShortcode || undefined
          );
          createdUrls.push(shortUrl);
        } catch (error) {
          logger.error('Failed to create short URL', { entry, error });
          setGlobalError(`Failed to create short URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return;
        }
      }

      logger.info('Successfully created short URLs', { count: createdUrls.length });
      onUrlsCreated(createdUrls);
      
      // Reset form
      setEntries([{ id: '1', originalUrl: '', validityMinutes: '', customShortcode: '', errors: {} }]);
      
    } catch (error) {
      logger.error('Form submission failed', { error });
      setGlobalError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Create Short URLs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Shorten up to 5 URLs at once. Custom shortcodes and validity periods are optional.
          </Typography>
        </Box>

        {globalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {globalError}
          </Alert>
        )}

        <Grid container spacing={2}>
          {entries.map((entry, index) => (
            <Grid item xs={12} key={entry.id}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={`URL ${index + 1}`} 
                    color="primary" 
                    size="small" 
                  />
                  {entries.length > 1 && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => removeEntry(entry.id)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Original URL *"
                      placeholder="https://example.com/very-long-url"
                      value={entry.originalUrl}
                      onChange={(e) => updateEntry(entry.id, 'originalUrl', e.target.value)}
                      error={!!entry.errors.originalUrl}
                      helperText={entry.errors.originalUrl}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode (Optional)"
                      placeholder="my-link"
                      value={entry.customShortcode}
                      onChange={(e) => updateEntry(entry.id, 'customShortcode', e.target.value)}
                      error={!!entry.errors.customShortcode}
                      helperText={entry.errors.customShortcode || "3-20 characters, letters, numbers, -, _"}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Validity (Minutes)"
                      placeholder="30"
                      type="number"
                      value={entry.validityMinutes}
                      onChange={(e) => updateEntry(entry.id, 'validityMinutes', e.target.value)}
                      error={!!entry.errors.validityMinutes}
                      helperText={entry.errors.validityMinutes || "Default: 30 minutes"}
                      variant="outlined"
                      inputProps={{ min: 1, max: 525600 }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addEntry}
            disabled={entries.length >= 5}
          >
            Add URL ({entries.length}/5)
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="large"
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create Short URLs'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};