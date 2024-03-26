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
    mutationFn: async ({
      venueId,
      reviewId,
      imageFiles,
      city,
      venueNameSlug,
    }) => {
      console.log(
        'log from react query',
        venueId,
        imageFiles,
        city,
        venueNameSlug
      );
      await createVenueImage({
        venueId,
        reviewId,
        imageFiles,
        city,
        venueNameSlug,
      });
    },
    onSuccess: (_, variables) => {
      toast.success('Images successfully uploaded');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue'] });
      queryClient.invalidateQueries({
        queryKey: ['reviews', variables.venueId],
      });
      console.log('Inavlidate queries should have ran');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return { uploadImageRef, isUploading, fileUploaded };
}
