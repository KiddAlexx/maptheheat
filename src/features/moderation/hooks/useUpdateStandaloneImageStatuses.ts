import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateModerationImageStatuses,
  UpdateModerationImageStatusesArgs,
} from '@/services/apiModeration';
import { ModerationStandaloneImageGroup } from '@/types/venueTypes';
import { applyImageStatusUpdate } from '../utils/applyImageStatusUpdate';

export function useUpdateStandaloneImageStatuses(groupId?: string) {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: updateImageStatuses } = useMutation({
    mutationFn: ({
      approvedImageIds,
      declinedImageIds,
    }: UpdateModerationImageStatusesArgs) =>
      updateModerationImageStatuses({ approvedImageIds, declinedImageIds }),
    onSuccess: (_data, { approvedImageIds, declinedImageIds }) => {
      toast.success('Image statuses updated');
      if (groupId) {
        queryClient.setQueryData<ModerationStandaloneImageGroup>(
          ['moderation', 'standaloneImageGroup', groupId],
          (currentGroup) =>
            updateCachedImageStatuses(currentGroup, {
              approvedImageIds,
              declinedImageIds,
            })
        );
        queryClient.invalidateQueries({
          queryKey: ['moderation', 'standaloneImageGroup', groupId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['moderation', 'standaloneImages'],
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isUpdating, updateImageStatuses };
}

function updateCachedImageStatuses(
  currentGroup: ModerationStandaloneImageGroup | undefined,
  args: UpdateModerationImageStatusesArgs
): ModerationStandaloneImageGroup | undefined {
  if (!currentGroup) return currentGroup;

  return {
    ...currentGroup,
    images: currentGroup.images.map((image) =>
      applyImageStatusUpdate(image, args)
    ),
  };
}
