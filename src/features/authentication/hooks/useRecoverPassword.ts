import { recoverPasswordApi } from '@/services/apiAuth';
import { Email } from '@/types/authenticationTypes';
import { useMutation } from '@tanstack/react-query';

export function useRecoverPassword() {
  const { mutate: recoverPassword, isPending } = useMutation({
    mutationFn: ({ email }: Email) => recoverPasswordApi({ email }),
  });

  return { recoverPassword, isPending };
}
