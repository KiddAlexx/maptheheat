import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVenueImage } from '../../../services/apiVenues';
import toast from 'react-hot-toast';

// Type Imports
import { ImageUploadParams } from '../../../models/venueTypes';

export function useUpdateVenueImage() {
  const queryClient = useQueryClient();

  const {
    mutate: uploadImageRef,
    isPending: isUploading,
    isSuccess: fileUploaded,
  } = useMutation<void, Error, ImageUploadParams>({
    mutationFn: async ({ id, imageFile, city, venue }) => {
      console.log('log from react query', id, imageFile, city, venue);
      await createVenueImage({ id, imageFile, city, venue });
    },
    onSuccess: () => {
      toast.success('Image successfully uploaded');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue'] });
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
