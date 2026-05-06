// React imports
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';

// Third Party Imports

import { Toaster } from 'react-hot-toast';

// Styles imports
import './App.css';

// Components and pages
import Homepage from './pages/Homepage';
import PageNotFound from './pages/PageNotFound';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorModal from './ui/ErrorModal';
import ModalManager from './components/ModalManager';
import RootLayout from './RootLayout';

// Lazy loaded pages + components
const AppLayout = lazy(() => import('./pages/AppLayout'));
const DetailedVenueView = lazy(
  () => import('./features/venues/components/DetailedVenueView')
);
const MapView = lazy(() => import('./features/map/MapView'));
const ReviewForm = lazy(
  () => import('./features/reviews/components/ReviewForm')
);
const Profile = lazy(() => import('./pages/Profile'));
const AddNewVenue = lazy(() => import('./pages/AddNewVenue'));
const AdminLayout = lazy(
  () => import('./features/moderation/components/AdminLayout')
);
const ModerationPlaceholder = lazy(
  () => import('./features/moderation/components/ModerationPlaceholder')
);

function App() {
  return (
    <>
      <Routes>
        <Route element={<RootLayout />}>
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
            path="/profile/:section?/:setting?"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="app" element={<AppLayout />}>
            <Route index element={<Navigate replace to="map" />} />
            <Route
              path="map/:city?/:country?/:venue?/:venueId?"
              element={<MapView />}
            />
            <Route
              path="venue/:city/:country?/:venue/:venueId"
              element={<DetailedVenueView />}
            />
            <Route
              path="venue/:city/:country?/:venue/reviews/new/:venueId"
              element={
                <ProtectedRoute>
                  <ReviewForm mode="creating" />
                </ProtectedRoute>
              }
            />
            <Route
              path="venue/:city/:country?/:venue/reviews/edit/:reviewId"
              element={
                <ProtectedRoute>
                  <ReviewForm mode="editing" />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate replace to="moderation/venues" />} />
            <Route
              path="moderation/venues"
              element={
                <ModerationPlaceholder
                  title="Venue moderation"
                  description="Review pending venue submissions, inspect attached images, edit details, and approve or decline venues."
                />
              }
            />
            <Route
              path="moderation/reviews"
              element={
                <ModerationPlaceholder
                  title="Review moderation"
                  description="Review moderation will be added after the venue workflow is stable."
                />
              }
            />
            <Route
              path="moderation/images"
              element={
                <ModerationPlaceholder
                  title="Image moderation"
                  description="Standalone image moderation will be added after venue submissions and venue images are handled."
                />
              }
            />
          </Route>
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>

      <ErrorModal />
      <ModalManager />
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: '8px' }}
        toastOptions={{
          success: {
            duration: 3000,
            /* Temp make all toasts alert due to status + poilte not being announced */
            ariaProps: { role: 'alert', 'aria-live': 'assertive' },
          },
          error: {
            duration: 5000,
            ariaProps: { role: 'alert', 'aria-live': 'assertive' },
          },
          style: {
            fontSize: '16px',
            maxWidth: '500px',
            padding: '16px 24px',
            backgroundColor: '#fff',
            color: '#374151',
          },
        }}
      />
    </>
  );
}

export default App;
