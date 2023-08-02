import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PageNav from './components/PageNav';
import Homepage from './pages/Homepage';
import AuthPage from './pages/AuthPage';
import AppLayout from './pages/AppLayout';
import PageNotFound from './pages/PageNotFound';

import './App.css';

function App() {
  return (
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
  );
}

export default App;
