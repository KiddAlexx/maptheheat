import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateModerationImageStatuses,
  UpdateModerationImageStatusesArgs,
} from '@/services/apiModeration';
import { ModerationImage, ModerationVenue } from '@/types/venueTypes';

export function useUpdateModerationImageStatuses(venueId?: string) {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateImageStatuses } = useMutation({
    mutationFn: ({
      approvedImageIds,
      declinedImageIds,
    }: UpdateModerationImageStatusesArgs) =>
      updateModerationImageStatuses({ approvedImageIds, declinedImageIds }),
    onSuccess: (_data, { approvedImageIds, declinedImageIds }) => {
      toast.success('Image statuses updated');
      if (venueId) {
        queryClient.setQueryData<ModerationVenue>(
          ['moderation', 'venue', venueId],
          (currentVenue) =>
            updateCachedImageStatuses(currentVenue, {
              approvedImageIds,
              declinedImageIds,
            })
        );
      }
      queryClient.invalidateQueries({ queryKey: ['moderation', 'venues'] });

      if (venueId) {
        queryClient.invalidateQueries({
          queryKey: ['moderation', 'venue', venueId],
        });
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isUpdating, updateImageStatuses };
}

function updateCachedImageStatuses(
  currentVenue: ModerationVenue | undefined,
  { approvedImageIds, declinedImageIds }: UpdateModerationImageStatusesArgs
): ModerationVenue | undefined {
  if (!currentVenue?.venueImages) return currentVenue;

  return {
    ...currentVenue,
    venueImages: currentVenue.venueImages.map((image) =>
      updateCachedImageStatus(image, { approvedImageIds, declinedImageIds })
    ),
  };
}

function updateCachedImageStatus(
  image: ModerationImage,
  { approvedImageIds, declinedImageIds }: UpdateModerationImageStatusesArgs
): ModerationImage {
  if (approvedImageIds.includes(image.imageId)) {
    return { ...image, status: 'approved' };
  }

  if (declinedImageIds.includes(image.imageId)) {
    return { ...image, status: 'declined' };
  }

  return image;
}
