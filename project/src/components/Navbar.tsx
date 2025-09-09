import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link, Analytics } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Link sx={{ fontSize: 28 }} />
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            fontWeight="bold"
          >
            URL Shortener
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            sx={{ 
              borderColor: location.pathname === '/' ? 'white' : 'transparent',
              minWidth: isMobile ? 'auto' : undefined,
              px: isMobile ? 1 : 2
            }}
          >
            {!isMobile && 'Create URLs'}
            {isMobile && <Link />}
          </Button>
          
          <Button
            color="inherit"
            onClick={() => navigate('/statistics')}
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
            startIcon={!isMobile ? <Analytics /> : undefined}
            sx={{ 
              borderColor: location.pathname === '/statistics' ? 'white' : 'transparent',
              minWidth: isMobile ? 'auto' : undefined,
              px: isMobile ? 1 : 2
            }}
          >
            {!isMobile && 'Statistics'}
            {isMobile && <Analytics />}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};