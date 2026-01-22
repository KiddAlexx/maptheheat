import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReviewApi } from '../../../services/apiReviews';
import toast from 'react-hot-toast';
import { EditformData } from '../components/ReviewForm';

interface UpdateReviewArgs {
  finalFormData: EditformData;
  reviewId: string;
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  const { mutate: updateReview, isPending: isUpdating } = useMutation({
    mutationFn: ({ finalFormData, reviewId }: UpdateReviewArgs) =>
      updateReviewApi(finalFormData, reviewId),
    onSuccess: () => {
      toast.success('Your review has been successfully updated!');
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
