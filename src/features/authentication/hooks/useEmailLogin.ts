import { useMutation, useQueryClient } from '@tanstack/react-query';

import { loginApi } from '../../../services/apiAuth';
import toast from 'react-hot-toast';
import { AuthCredentials } from '../../../types/authenticationTypes';
import { useModalContext } from '../../../context/ModalContext';

export function useEmailLogin() {
  const { closeModal } = useModalContext();
  const queryClient = useQueryClient();
  const { mutate: loginEmail, isPending } = useMutation({
    mutationFn: ({ email, password }: AuthCredentials) =>
      loginApi({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user.user);

      closeModal();
    },
    onError: () => {
      toast.error(`Provided email or password are incorrect`);
    },
  });
  return { loginEmail, isPending };
}
