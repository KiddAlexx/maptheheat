import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PageNav from './components/PageNav';
import Homepage from './pages/Homepage';
import AuthPage from './pages/AuthPage';
import AppLayout from './pages/AppLayout';
import PageNotFound from './pages/PageNotFound';

import { RestaurantsProvider } from './context/RestaurantContext';

import './App.css';
import MapView from './components/MapView';
import UserProfile from './components/UserProfile';
import DetailedVenueView from './components/DetailedVenueView';

function App() {
  return (
    <RestaurantsProvider>
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
            <Route path="venue/:city/:venue" element={<DetailedVenueView />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </RestaurantsProvider>
  );
}

export default App;
