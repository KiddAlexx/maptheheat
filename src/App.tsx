// React imports
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Third Party Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Styles imports
import './App.css';

// Hooks imports
import { GlobalErrorProvider } from './context/ErrorContext';

// Component imports

import Homepage from './pages/Homepage';
import AppLayout from './pages/AppLayout';
import PageNotFound from './pages/PageNotFound';
import DetailedVenueView from './features/venues/components/DetailedVenueView';
import MapView from './features/map/MapView';
import PageNav from './features/layout/PageNav';
import ProtectedRoute from './components/ProtectedRoute';
import { ModalProvider } from './context/ModalContext';
import ErrorModal from './ui/ErrorModal';
import ModalManager from './components/ModalManager';
import ReviewForm from './features/reviews/components/ReviewForm';
import AddNewVenue from './pages/AddNewVenue';
import { NextUIProvider } from '@nextui-org/system';
import { VenueFilterProvider } from './context/VenueFilterContext';
import { ReviewSortProvider } from './context/ReviewSortContext';
import { UserReviewsProvider } from './context/UserReviewsContext';
import { UserFavVenuesProvider } from './context/UserFavVenuesContext';
import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  const navigate = useNavigate();
  return (
    <NextUIProvider navigate={navigate}>
      <GlobalErrorProvider>
        <VenueFilterProvider>
          <UserFavVenuesProvider>
            <ReviewSortProvider>
              <UserReviewsProvider>
                <ModalProvider>
                  <QueryClientProvider client={queryClient}>
                    <ReactQueryDevtools initialIsOpen={false} />

                    <PageNav />
                    <Routes>
                      <Route path="/" element={<Homepage />} />
                      <Route
                        path="/add-venue"
                        element={
                          <ProtectedRoute>
                            <AddNewVenue />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="app" element={<AppLayout />}>
                        <Route index element={<Navigate replace to="map" />} />
                        <Route
                          path="map/:city?/:venue?/:venueId?"
                          element={<MapView />}
                        />
                        <Route
                          path="venue/:city/:venue/:venueId"
                          element={<DetailedVenueView />}
                        />
                        <Route
                          path="venue/:city/:venue/reviews/new/:venueId"
                          element={
                            <ProtectedRoute>
                              <ReviewForm mode="creating" />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="venue/:city/:venue/reviews/edit/:reviewId"
                          element={
                            <ProtectedRoute>
                              <ReviewForm mode="editing" />
                            </ProtectedRoute>
                          }
                        />
                      </Route>
                      <Route path="*" element={<PageNotFound />} />
                    </Routes>
                    <ErrorModal />
                    <ModalManager />

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
                </ModalProvider>
              </UserReviewsProvider>
            </ReviewSortProvider>
          </UserFavVenuesProvider>
        </VenueFilterProvider>
      </GlobalErrorProvider>
    </NextUIProvider>
  );
}

export default App;
