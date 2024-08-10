import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../../services/apiAuth';

export function useUser() {
  const {
    isLoading,
    data: user,
    fetchStatus,
  } = useQuery({ queryKey: ['user'], queryFn: getCurrentUser });

  return {
    isLoading,
    user,
    fetchStatus,
    isAuthenticated: user?.role === 'authenticated',
  };
}
