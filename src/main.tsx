import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { StyleProvider } from './contexts/StyleContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <StyleProvider>
        <App />
      </StyleProvider>
    </ThemeProvider>
  </StrictMode>
);
