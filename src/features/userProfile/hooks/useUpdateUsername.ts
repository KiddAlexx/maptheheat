import {
  updateUsernameApi,
  UpdateUsernameParams,
} from '@/services/apiUserProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  const { mutate: updateUsername, isPending: isUpdating } = useMutation({
    mutationFn: ({ username }: UpdateUsernameParams) =>
      updateUsernameApi({ username }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
  return { updateUsername, isUpdating };
}
