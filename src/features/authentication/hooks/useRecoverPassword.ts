import { recoverPasswordApi } from '@/services/apiAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useRecoverPassword() {
  const { mutate: recoverPassword, isPending } = useMutation({
    mutationFn: ({ email }) => recoverPasswordApi({ email }),
    onSuccess: () => {
      toast.success('Email sent with instructions to reset password');
    },
    onError: () => {
      toast.error(`Error sending email, please try again`);
    },
  });

  return { recoverPassword, isPending };
}
