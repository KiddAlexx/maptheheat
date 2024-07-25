import {
  updateUsernameApi,
  UpdateUsernameParams,
} from '@/services/apiUserProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  const { mutate: updateUsername, isPending: isUpdating } = useMutation({
    mutationFn: ({ username }: UpdateUsernameParams) =>
      updateUsernameApi({ username }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Username successfully updated');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return { updateUsername, isUpdating };
}
