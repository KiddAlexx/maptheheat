// Hooks
import { useNavigate } from 'react-router';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useModalContext } from '@/context/ModalContext';
import { useEffect, ReactNode } from 'react';

// Components
import LoaderSpinner from '@/ui/LoaderSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { openModal, modalOpen } = useModalContext();

  // 1. Load the authenticated user
  const { isPending, isAuthenticated, isFetching } = useUser();

  // 2. If there is no authenticated user, redirect to login page
  useEffect(
    function () {
      if (!isAuthenticated && !isPending && isFetching && !modalOpen) {
        openModal('login');
      }
    },
    [isAuthenticated, isPending, isFetching, modalOpen, openModal, navigate]
  );

  // 3. Show spinner while loading
  if (isPending) return <LoaderSpinner message="Checking session" />;

  // 4. If there is an authenticated user then render component

  if (isAuthenticated) return children;
  return null;
}

export default ProtectedRoute;
