import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateModerationImageStatuses,
  UpdateModerationImageStatusesArgs,
} from '@/services/apiModeration';

export function useUpdateModerationImageStatuses(venueId?: string) {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateImageStatuses } = useMutation({
    mutationFn: ({
      approvedImageIds,
      declinedImageIds,
    }: UpdateModerationImageStatusesArgs) =>
      updateModerationImageStatuses({ approvedImageIds, declinedImageIds }),
    onSuccess: () => {
      toast.success('Image statuses updated');
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
