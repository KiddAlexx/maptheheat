// React imports
import { Routes, Route, Navigate } from 'react-router-dom';

// Third Party Imports

import { Toaster } from 'react-hot-toast';

// Styles imports
import './App.css';

// Hooks imports

// Component imports

import Homepage from './pages/Homepage';
import AppLayout from './pages/AppLayout';
import PageNotFound from './pages/PageNotFound';
import DetailedVenueView from './features/venues/components/DetailedVenueView';
import MapView from './features/map/MapView';

import ProtectedRoute from './components/ProtectedRoute';

import ErrorModal from './ui/ErrorModal';
import ModalManager from './components/ModalManager';
import ReviewForm from './features/reviews/components/ReviewForm';
import AddNewVenue from './pages/AddNewVenue';

import Profile from './pages/Profile';

import AppProviders from './AppProviders';
import PageNav from './ui/PageNav';

function App() {
  return (
    <AppProviders>
      <div className="flex h-dvh flex-col">
        <header>
          <PageNav />
        </header>
        <div className="min-h-0 flex-1">
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
        </div>
      </div>
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
    </AppProviders>
  );
}

export default App;
