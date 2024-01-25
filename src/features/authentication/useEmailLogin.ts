import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { loginApi } from '../../services/apiAuth';
import toast from 'react-hot-toast';

export function useEmailLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: loginEmail, isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user.user);
      navigate('/app/map', { replace: true });
    },
    onError: (err) => {
      toast.error('Provided email or password are incorrect');
    },
  });
  return { loginEmail, isLoading };
}
