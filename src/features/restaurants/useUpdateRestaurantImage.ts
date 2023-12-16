import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRestaurantImage } from '../../services/apiRestaurants';
import toast from 'react-hot-toast';

export function useUpdateRestaurantImage() {
  const queryClient = useQueryClient();

  const { mutate: uploadImageRef, isPending: isUploading } = useMutation({
    mutationFn: ({ restaurantId, imgFile, city, restaurantName }) =>
      createRestaurantImage(restaurantId, imgFile, city, restaurantName),
    onSuccess: () => {
      toast.success('Image successfully uploaded');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: (err) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
  return { uploadImageRef, isUploading };
}
