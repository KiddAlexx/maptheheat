import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReviewApi } from '@/services/apiReviews';
import toast from 'react-hot-toast';

export function useCreateReview() {
  const queryClient = useQueryClient();

  const { mutateAsync: createReview, isPending: isCreating } = useMutation({
    mutationFn: createReviewApi,
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
  return { isCreating, createReview };
}
