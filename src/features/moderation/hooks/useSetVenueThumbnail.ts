import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { setVenueThumbnail, type SetVenueThumbnailArgs } from '@/services/apiModeration';

export function useSetVenueThumbnail(venueId: string) {
  const queryClient = useQueryClient();

  const { isPending: isSetting, mutate: setThumbnail } = useMutation({
    mutationFn: (args: SetVenueThumbnailArgs) => setVenueThumbnail(args),
    onSuccess: () => {
      toast.success('Thumbnail updated');
      queryClient.invalidateQueries({ queryKey: ['moderation', 'venue', venueId] });
      queryClient.invalidateQueries({ queryKey: ['moderation', 'venues'] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return { isSetting, setThumbnail };
}
