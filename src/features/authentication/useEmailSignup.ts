import { useMutation } from '@tanstack/react-query';
import { signupApi } from '../../services/apiAuth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

export function useEmailSignup() {
  const navigate = useNavigate();
  const { mutate: signupEmail, isPending } = useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      toast.success(
        'Account successfully created! Please check your emails and verify your account'
      );
      navigate('/login', { replace: true });
    },
    onError: (err) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
  return { signupEmail, isPending };
}
