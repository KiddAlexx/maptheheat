import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import toast from 'react-hot-toast';
import { loginGoogleApi } from '../../services/apiAuth';

export function useGoogleLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: loginGoogle, isPending } = useMutation({
    mutationFn: () => loginGoogleApi(),
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user.user);
      navigate('/app/map', { replace: true });
    },
    onError: (err) => {
      toast.error('Google authenticaion failed');
    },
  });
  return { loginGoogle, isPending };
}
