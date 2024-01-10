// React imports
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Third Party Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Styles imports
import './App.css';

// Hooks imports
import { RestaurantsProvider } from './context/RestaurantContext';

// Component imports

import Homepage from './pages/Homepage';
import AuthPage from './pages/AuthPage';
import AppLayout from './pages/AppLayout';
import PageNotFound from './pages/PageNotFound';
import DetailedVenueView from './components/DetailedVenueView';
import MapView from './components/MapView';
import UserProfile from './components/UserProfile';
import PageNav from './components/PageNav';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  return (
    <RestaurantsProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <BrowserRouter>
          <PageNav />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="login" element={<AuthPage />} />
            <Route path="signup" element={<AuthPage />} />
            <Route path="app" element={<AppLayout />}>
              <Route index element={<Navigate replace to="map" />} />
              <Route
                path="map/:city?/:venue?/:id?/:lat?/:lng?"
                element={<MapView />}
              />
              <Route path="profile" element={<UserProfile />} />
              <Route
                path="venue/:city/:venue/:id"
                element={<DetailedVenueView />}
              />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: '8px' }}
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 5000 },
            style: {
              fontSize: '16',
              maxWidth: '500px',
              padding: '16px 24px',
              backgroundColor: '#fff',
              color: '#374151',
            },
          }}
        />
      </QueryClientProvider>
    </RestaurantsProvider>
  );
}

export default App;
