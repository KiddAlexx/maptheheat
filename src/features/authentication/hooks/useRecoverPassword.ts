import { recoverPasswordApi } from '@/services/apiAuth';
import { useMutation } from '@tanstack/react-query';

export function useRecoverPassword() {
  const { mutate: recoverPassword, isPending } = useMutation({
    mutationFn: ({ email }) => recoverPasswordApi({ email }),
  });

  return { recoverPassword, isPending };
}
