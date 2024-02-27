import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { loginApi } from '../../services/apiAuth';
import toast from 'react-hot-toast';
import { AuthCredentials } from '../../models/authenticationTypes';
import { useModalContext } from '../../context/ModalContext';

export function useEmailLogin() {
  const navigate = useNavigate();
  const { closeModal } = useModalContext();
  const queryClient = useQueryClient();
  const { mutate: loginEmail, isPending } = useMutation({
    mutationFn: ({ email, password }: AuthCredentials) =>
      loginApi({ email, password }),
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user.user);
      console.log(user);
      closeModal();
      navigate('/app/map', { replace: true });
    },
    onError: () => {
      toast.error(`Provided email or password are incorrect`);
    },
  });
  return { loginEmail, isPending };
}
