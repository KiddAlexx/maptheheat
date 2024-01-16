import { useMutation } from '@tanstack/react-query';
import { signupApi } from '../../services/apiAuth';
import toast from 'react-hot-toast';

export function useEmailSignup() {
  const { mutate: signupEmail, isLoading } = useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      toast.success(
        'Account successfully created! Please check your emails and verify your account'
      );
    },
  });
  return { signupEmail, isLoading };
}
