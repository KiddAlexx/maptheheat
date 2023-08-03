import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PageNav from './components/PageNav';
import Homepage from './pages/Homepage';
import AuthPage from './pages/AuthPage';
import AppLayout from './pages/AppLayout';
import PageNotFound from './pages/PageNotFound';

import { RestaurantsProvider } from './context/RestaurantContext';

import './App.css';

function App() {
  return (
    <RestaurantsProvider>
      <BrowserRouter>
        <PageNav />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="login" element={<AuthPage />} />
          <Route path="signup" element={<AuthPage />} />
          <Route path="app" element={<AppLayout />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </RestaurantsProvider>
  );
}

export default App;
