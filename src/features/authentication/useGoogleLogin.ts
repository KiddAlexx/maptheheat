import { useMutation, useQueryClient } from '@tanstack/react-query';

import toast from 'react-hot-toast';
import { loginGoogleApi } from '../../services/apiAuth';

export function useGoogleLogin() {
  const queryClient = useQueryClient();
  const { mutate: loginGoogle, isPending } = useMutation({
    mutationFn: () => loginGoogleApi(),
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user.user);
    },
    onError: (err) => {
      toast.error('Google authenticaion failed');
    },
  });
  return { loginGoogle, isPending };
}
