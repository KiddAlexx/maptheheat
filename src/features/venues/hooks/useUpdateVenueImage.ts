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
    mutationFn: async ({ venueId, imageFiles, city, venueNameSlug }) => {
      console.log(
        'log from react query',
        venueId,
        imageFiles,
        city,
        venueNameSlug
      );
      await createVenueImage({ venueId, imageFiles, city, venueNameSlug });
    },
    onSuccess: () => {
      toast.success('Image successfully uploaded');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue'] });
      console.log('Inavlidate queries should have ran');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return { uploadImageRef, isUploading, fileUploaded };
}
