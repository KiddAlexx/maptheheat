import { useMutation } from '@tanstack/react-query';
import { signupApi } from '../../../services/apiAuth';

export function useEmailSignup() {
  const { mutate: signupEmail, isPending } = useMutation({
    mutationFn: signupApi,
  });
  return { signupEmail, isPending };
}
