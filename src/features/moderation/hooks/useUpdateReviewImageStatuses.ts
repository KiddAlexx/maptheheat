import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateModerationImageStatuses,
  UpdateModerationImageStatusesArgs,
} from '@/services/apiModeration';
import { ModerationReview } from '@/types/reviewTypes';
import { applyImageStatusUpdate } from '../utils/applyImageStatusUpdate';

export function useUpdateReviewImageStatuses(reviewId?: string) {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateImageStatuses } = useMutation({
    mutationFn: ({
      approvedImageIds,
      declinedImageIds,
    }: UpdateModerationImageStatusesArgs) =>
      updateModerationImageStatuses({ approvedImageIds, declinedImageIds }),
    onSuccess: (_data, { approvedImageIds, declinedImageIds }) => {
      toast.success('Image statuses updated');
      if (reviewId) {
        queryClient.setQueryData<ModerationReview>(
          ['moderation', 'review', reviewId],
          (currentReview) =>
            updateCachedImageStatuses(currentReview, {
              approvedImageIds,
              declinedImageIds,
            })
        );
        queryClient.invalidateQueries({
          queryKey: ['moderation', 'review', reviewId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['moderation', 'reviews'] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isUpdating, updateImageStatuses };
}

function updateCachedImageStatuses(
  currentReview: ModerationReview | undefined,
  args: UpdateModerationImageStatusesArgs
): ModerationReview | undefined {
  if (!currentReview?.venueImages) return currentReview;

  return {
    ...currentReview,
    venueImages: currentReview.venueImages.map((image) =>
      applyImageStatusUpdate(image, args)
    ),
  };
}
