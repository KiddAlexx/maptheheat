import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateModerationImageStatuses,
  UpdateModerationImageStatusesArgs,
} from '@/services/apiModeration';
import { ModerationVenue } from '@/types/venueTypes';
import { applyImageStatusUpdate } from '../utils/applyImageStatusUpdate';

export function useUpdateVenueImageStatuses(venueId?: string) {
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
        queryClient.invalidateQueries({
          queryKey: ['moderation', 'venue', venueId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['moderation', 'venues'] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isUpdating, updateImageStatuses };
}

function updateCachedImageStatuses(
  currentVenue: ModerationVenue | undefined,
  args: UpdateModerationImageStatusesArgs
): ModerationVenue | undefined {
  if (!currentVenue?.venueImages) return currentVenue;

  return {
    ...currentVenue,
    venueImages: currentVenue.venueImages.map((image) =>
      applyImageStatusUpdate(image, args)
    ),
  };
}
