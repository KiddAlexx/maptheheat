import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from 'react-error-boundary';

import './index.css';
import { BrowserRouter } from 'react-router-dom';
import ErrorFallback from './ui/ErrorFallback.tsx';
import AppProviders from './AppProviders.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <App />
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
