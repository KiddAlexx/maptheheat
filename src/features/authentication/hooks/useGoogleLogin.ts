import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { loginGoogleApi } from '@/services/apiAuth';

export function useGoogleLogin() {
  const { mutate: loginGoogle, isPending } = useMutation({
    mutationFn: () => loginGoogleApi(),

    onError: () => {
      toast.error('Google authenticaion failed');
    },
  });
  return { loginGoogle, isPending };
}
