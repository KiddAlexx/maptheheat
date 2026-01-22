import { useMutation, useQueryClient } from '@tanstack/react-query';

import { loginApi } from '@/services/apiAuth';

import type { AuthCredentials } from '@/types/authenticationTypes';

export function useEmailLogin() {
  const queryClient = useQueryClient();
  const { mutate: loginEmail, isPending } = useMutation({
    mutationFn: ({ email, password }: AuthCredentials) =>
      loginApi({ email, password }),
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });
  return { loginEmail, isPending };
}
