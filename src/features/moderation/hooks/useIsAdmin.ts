import { useQuery } from '@tanstack/react-query';
import { getIsAdmin } from '@/services/apiModeration';

export function useIsAdmin(enabled: boolean) {
  const {
    data: isAdmin = false,
    error,
    isPending,
  } = useQuery({
    queryKey: ['admin', 'isAdmin'],
    queryFn: getIsAdmin,
    enabled,
    staleTime: 60_000,
  });

  return { error, isAdmin, isPending };
}
