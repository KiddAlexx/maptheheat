import './instrument';
import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import './index.css';
import { BrowserRouter } from 'react-router-dom';
import ErrorFallback from './ui/ErrorFallback.tsx';
import AppProviders from './AppProviders.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AppProviders>
          <ErrorBoundary FallbackComponent={ErrorFallback} onError={(error) => Sentry.captureException(error)}>
            <App />
          </ErrorBoundary>
        </AppProviders>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
