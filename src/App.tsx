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
import DetailedVenueView from './features/venues/shared/DetailedVenueView';
import MapView from './features/map/MapView';
import UserProfile from './features/userProfile/UserProfile';
import PageNav from './features/layout/PageNav';
import ProtectedRoute from './components/ProtectedRoute';

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
            <Route path="login" element={<AuthPage formType="login" />} />
            <Route path="signup" element={<AuthPage formType="signup" />} />
            <Route path="app" element={<AppLayout />}>
              <Route index element={<Navigate replace to="map" />} />
              <Route path="map/:city?/:venue?" element={<MapView />} />
              <Route
                path="venue/:city/:venue"
                element={<DetailedVenueView />}
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
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
