import { useQuery } from '@tanstack/react-query';
import { getModerationStandaloneImageGroup } from '@/services/apiModeration';

export function useModerationStandaloneImageGroup(groupId?: string) {
  const {
    data: imageGroup,
    error,
    isPending,
  } = useQuery({
    queryKey: ['moderation', 'standaloneImageGroup', groupId],
    queryFn: () => getModerationStandaloneImageGroup(groupId!),
    enabled: !!groupId,
    staleTime: 60_000,
  });

  return { error, imageGroup, isPending };
}
