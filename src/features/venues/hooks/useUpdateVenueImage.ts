import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVenueImage } from '@/services/apiVenues';
import toast from 'react-hot-toast';

// Type Imports
import type { ImageUploadParams } from '@/types/venueTypes';

export function useUpdateVenueImage() {
  const queryClient = useQueryClient();

  const {
    mutate: uploadImageRef,
    isPending: isUploading,
    isSuccess: fileUploaded,
    error: uploadError,
  } = useMutation<void, Error, ImageUploadParams>({
    mutationFn: async ({
      venueId,
      reviewId,
      imageFiles,
      city,
      venueNameSlug,
      imageType,
    }) => {
      await createVenueImage({
        venueId,
        reviewId,
        imageFiles,
        city,
        venueNameSlug,
        imageType,
      });
    },
    onSuccess: (_, variables) => {
      toast.success('Images successfully uploaded');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue'] });
      queryClient.invalidateQueries({
        queryKey: ['reviews', variables.venueId],
      });
    },
  });
  return { uploadImageRef, isUploading, fileUploaded, uploadError };
}
