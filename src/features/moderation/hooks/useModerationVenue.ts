import { useQuery } from '@tanstack/react-query';
import { getModerationVenue } from '@/services/apiModeration';

export function useModerationVenue(venueId?: string) {
  const {
    data: venue,
    error,
    isPending,
  } = useQuery({
    queryKey: ['moderation', 'venue', venueId],
    queryFn: () => getModerationVenue(venueId!),
    enabled: !!venueId,
    staleTime: 60_000,
  });

  return { error, isPending, venue };
}
