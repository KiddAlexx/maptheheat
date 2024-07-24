import { updatePasswordApi } from '@/services/apiAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  const { mutate: updatePassword, isPending } = useMutation({
    mutationFn: ({ password }) => updatePasswordApi({ password }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user'],
      });
      queryClient.invalidateQueries({
        queryKey: ['profile'],
      });
      toast.success(`Password successfully updated.`);
    },
    onError: () => {
      toast.error(`Error updating password, please try again`);
    },
  });
  return { updatePassword, isPending };
}
