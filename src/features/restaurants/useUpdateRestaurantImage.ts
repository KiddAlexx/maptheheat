import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRestaurantImage } from '../../services/apiRestaurants';
import toast from 'react-hot-toast';

export function useUpdateRestaurantImage() {
  const queryClient = useQueryClient();

  const { mutate: uploadImageRef, isPending: isUploading } = useMutation({
    mutationFn: async ({ id, imageFile, city, restaurantName }) => {
      console.log('log from react query', id, imageFile, city, restaurantName);
      await createRestaurantImage(id, imageFile, city, restaurantName);
    },
    onSuccess: () => {
      toast.success('Image successfully uploaded');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant'] });
      console.log('Inavlidate queries should have ran');
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
