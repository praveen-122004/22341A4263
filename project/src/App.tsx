import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { StatisticsPage } from './pages/StatisticsPage';
import { RedirectHandler } from './components/RedirectHandler';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/:shortCode" element={<RedirectHandler />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;