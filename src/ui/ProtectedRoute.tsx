import { useNavigate } from 'react-router';
import { useUser } from '../features/authentication/useUser';
import { useEffect } from 'react';
import LoaderSpinner from '../components/LoaderSpinner';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  // 1. Load the authenticated user
  const { isLoading, isAuthenticated, fetchStatus } = useUser();

  // 2. If there is no authenticated user, redirect to login page
  useEffect(
    function () {
      if (!isAuthenticated && !isLoading && fetchStatus !== 'fetching') {
        navigate('/login');
      }
      console.log(isAuthenticated);
    },
    [isAuthenticated, isLoading, navigate, fetchStatus]
  );

  // 3. Show spinner while loading
  if (isLoading) return <LoaderSpinner />;

  // 4. If there is an authenticated user then render component

  if (isAuthenticated) return children;
  return <div></div>;
}

export default ProtectedRoute;
