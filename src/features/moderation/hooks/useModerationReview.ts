import { useQuery } from '@tanstack/react-query';
import { getModerationReview } from '@/services/apiModeration';

export function useModerationReview(reviewId?: string) {
  const {
    data: review,
    error,
    isPending,
  } = useQuery({
    queryKey: ['moderation', 'review', reviewId],
    queryFn: () => getModerationReview(reviewId!),
    enabled: !!reviewId,
    staleTime: 60_000,
  });

  return { error, isPending, review };
}
