import { useNavigate } from 'react-router';
import { useUser } from '../features/authentication/useUser';
import { useEffect, ReactNode } from 'react';
import LoaderSpinner from '../ui/LoaderSpinner';
import { useModalContext } from '../context/ModalContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { openModal, modalOpen } = useModalContext();

  // 1. Load the authenticated user
  const { isLoading, isAuthenticated, fetchStatus } = useUser();

  // 2. If there is no authenticated user, redirect to login page
  useEffect(
    function () {
      if (
        !isAuthenticated &&
        !isLoading &&
        fetchStatus !== 'fetching' &&
        !modalOpen
      ) {
        navigate('/app/map');

        openModal('login');
      }
      console.log(isAuthenticated);
    },
    [isAuthenticated, isLoading, fetchStatus, modalOpen, openModal, navigate]
  );

  // 3. Show spinner while loading
  if (isLoading) return <LoaderSpinner />;

  // 4. If there is an authenticated user then render component

  if (isAuthenticated) return children;
  return <div></div>;
}

export default ProtectedRoute;
