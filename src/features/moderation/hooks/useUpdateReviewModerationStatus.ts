import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateReviewModerationStatus,
  UpdateReviewModerationStatusArgs,
} from '@/services/apiModeration';

export function useUpdateReviewModerationStatus() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateStatus } = useMutation({
    mutationFn: ({ reviewId, status }: UpdateReviewModerationStatusArgs) =>
      updateReviewModerationStatus({ reviewId, status }),
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
