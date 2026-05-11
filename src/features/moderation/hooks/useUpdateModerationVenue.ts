import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateModerationVenue,
  UpdateModerationVenueArgs,
} from '@/services/apiModeration';
import { ModerationVenue } from '@/types/venueTypes';

export function useUpdateModerationVenue() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateVenue } = useMutation({
    mutationFn: ({ venueId, venueUpdate }: UpdateModerationVenueArgs) =>
      updateModerationVenue({ venueId, venueUpdate }),
    onSuccess: (updatedVenue, { venueId }) => {
      toast.success('Venue updated');
      queryClient.setQueryData<ModerationVenue>(
        ['moderation', 'venue', venueId],
        (currentVenue) => mergeModerationVenue(currentVenue, updatedVenue)
      );
      queryClient.invalidateQueries({ queryKey: ['moderation', 'venues'] });
      queryClient.invalidateQueries({
        queryKey: ['moderation', 'venue', venueId],
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isUpdating, updateVenue };
}

function mergeModerationVenue(
  currentVenue: ModerationVenue | undefined,
  updatedVenue: ModerationVenue
): ModerationVenue {
  if (!currentVenue) return updatedVenue;

  return {
    ...currentVenue,
    ...updatedVenue,
    submitterUsername:
      updatedVenue.submitterUsername ?? currentVenue.submitterUsername,
    venueImages: updatedVenue.venueImages ?? currentVenue.venueImages,
  };
}
