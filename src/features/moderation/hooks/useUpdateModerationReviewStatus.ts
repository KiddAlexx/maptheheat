import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateModerationReviewStatus,
  UpdateModerationReviewStatusArgs,
} from '@/services/apiModeration';

export function useUpdateModerationReviewStatus() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateStatus } = useMutation({
    mutationFn: ({ reviewId, status }: UpdateModerationReviewStatusArgs) =>
      updateModerationReviewStatus({ reviewId, status }),
    onSuccess: (_data, { reviewId }) => {
      toast.success('Review status updated');
      queryClient.invalidateQueries({ queryKey: ['moderation', 'reviews'] });
      queryClient.invalidateQueries({
        queryKey: ['moderation', 'review', reviewId],
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isUpdating, updateStatus };
}
