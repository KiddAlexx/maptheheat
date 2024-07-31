import { updateAvatarApi } from '@/services/apiUserProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export async function useUpdateAvatar() {
  const queryClient = useQueryClient();

  const { mutate: updateAvatar, isPending: isUpdating } = useMutation({
    mutationFn: ({ avatar }) => updateAvatarApi({ avatar }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar successfully updated');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return { updateAvatar, isUpdating };
}
