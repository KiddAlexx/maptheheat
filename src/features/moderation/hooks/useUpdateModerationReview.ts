import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateModerationReview,
  UpdateModerationReviewArgs,
} from '@/services/apiModeration';
import { ModerationReview } from '@/types/reviewTypes';

export function useUpdateModerationReview() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateReview } = useMutation({
    mutationFn: ({ reviewId, reviewUpdate }: UpdateModerationReviewArgs) =>
      updateModerationReview({ reviewId, reviewUpdate }),
    onSuccess: (updatedReview, { reviewId }) => {
      toast.success('Review updated');
      queryClient.setQueryData<ModerationReview>(
        ['moderation', 'review', reviewId],
        (currentReview) => mergeModerationReview(currentReview, updatedReview)
      );
      queryClient.invalidateQueries({ queryKey: ['moderation', 'reviews'] });
      queryClient.invalidateQueries({
        queryKey: ['moderation', 'review', reviewId],
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isUpdating, updateReview };
}

function mergeModerationReview(
  currentReview: ModerationReview | undefined,
  updatedReview: ModerationReview
): ModerationReview {
  if (!currentReview) return updatedReview;

  return {
    ...currentReview,
    ...updatedReview,
    submitterUsername:
      updatedReview.submitterUsername ?? currentReview.submitterUsername,
    venueDetails: updatedReview.venueDetails ?? currentReview.venueDetails,
    venueImages: updatedReview.venueImages ?? currentReview.venueImages,
  };
}
