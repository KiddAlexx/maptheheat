import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReview as deleteReviewApi } from '../../../services/apiReviews';
import toast from 'react-hot-toast';

export function useDeleteReview() {
  const queryClient = useQueryClient();

  const { isPending: isDeleting, mutate: deleteReview } = useMutation({
    mutationFn: deleteReviewApi,
    onSuccess: () => {
      toast.success('Review successfully deleted');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['venue'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err) => toast.error(err.message),
  });
  return { isDeleting, deleteReview };
}
