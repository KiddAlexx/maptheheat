import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRestaurantImage } from '../../../services/apiRestaurants';
import toast from 'react-hot-toast';

export function useUpdateRestaurantImage() {
  const queryClient = useQueryClient();

  const {
    mutate: uploadImageRef,
    isPending: isUploading,
    isSuccess: fileUploaded,
  } = useMutation({
    mutationFn: async ({ id, imageFile, city, venue }) => {
      console.log('log from react query', id, imageFile, city, venue);
      await createRestaurantImage({ id, imageFile, city, venue });
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
  return { uploadImageRef, isUploading, fileUploaded };
}
