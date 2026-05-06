import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateVenueModerationStatus,
  UpdateVenueModerationStatusArgs,
} from '@/services/apiModeration';

export function useUpdateVenueModerationStatus() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateStatus } = useMutation({
    mutationFn: ({ venueId, status }: UpdateVenueModerationStatusArgs) =>
      updateVenueModerationStatus({ venueId, status }),
    onSuccess: (_data, { venueId }) => {
      toast.success('Venue status updated');
      queryClient.invalidateQueries({ queryKey: ['moderation', 'venues'] });
      queryClient.invalidateQueries({
        queryKey: ['moderation', 'venue', venueId],
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isUpdating, updateStatus };
}
