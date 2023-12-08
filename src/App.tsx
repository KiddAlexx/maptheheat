// React imports
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Third Party Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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
              <Route path="map" element={<MapView />} />
              <Route path="profile" element={<UserProfile />} />
              <Route
                path="venue/:city/:venue"
                element={<DetailedVenueView />}
              />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </RestaurantsProvider>
  );
}

export default App;
