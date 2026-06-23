import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteAccount } from '@/services/apiUserProfiles';
import { clearLocalSessionApi } from '@/services/apiAuth';

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: triggerDeleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: (deleteReviews: boolean) => deleteAccount(deleteReviews),
    onSuccess: async () => {
      try {
        await clearLocalSessionApi();
      } catch (error) {
        console.error('Could not clear local session after account deletion', error);
      }

      queryClient.removeQueries();
      navigate('/', { replace: true });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { triggerDeleteAccount, isDeleting };
}
