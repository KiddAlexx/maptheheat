import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReview as updateReviewApi } from '../../../services/apiReviews';
import toast from 'react-hot-toast';

export function useUpdateReview() {
  const queryClient = useQueryClient();
  const { mutate: updateReview, isPending: isUpdating } = useMutation({
    mutationFn: ({ updatedReview, reviewId }) =>
      updateReviewApi(updatedReview, reviewId),
    onSuccess: () => {
      toast.success('Your review has been successfully added!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['venue'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return { isUpdating, updateReview };
}
