import { updateEmailApi } from '@/services/apiAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useUpdateEmail() {
  const queryClient = useQueryClient();
  const { mutate: updateEMail, isPending } = useMutation({
    mutationFn: ({ email }) => updateEmailApi({ email }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user'],
      });
      queryClient.invalidateQueries({
        queryKey: ['profile'],
      });
      toast.success(
        `Email successfully updated. Please check your email to verify`
      );
    },
    onError: () => {
      toast.error(`Error updating email, please try again`);
    },
  });
  return { updateEMail, isPending };
}
