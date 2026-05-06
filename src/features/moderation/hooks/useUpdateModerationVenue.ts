import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateModerationVenue,
  UpdateModerationVenueArgs,
} from '@/services/apiModeration';

export function useUpdateModerationVenue() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateVenue } = useMutation({
    mutationFn: ({ venueId, venueUpdate }: UpdateModerationVenueArgs) =>
      updateModerationVenue({ venueId, venueUpdate }),
    onSuccess: (_data, { venueId }) => {
      toast.success('Venue updated');
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
