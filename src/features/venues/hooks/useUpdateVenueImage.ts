import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVenueImage } from '@/services/apiVenues';
import toast from 'react-hot-toast';

export function useUpdateVenueImage() {
  const queryClient = useQueryClient();

  const {
    mutate: uploadImageRef,
    isPending: isUploading,
    isSuccess: fileUploaded,
    error: uploadError,
  } = useMutation({
    mutationFn: createVenueImage,
    onSuccess: (_, variables) => {
      toast.success('Images successfully uploaded');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue', variables.venueId] });
      queryClient.invalidateQueries({
        queryKey: ['reviews', variables.venueId],
      });
    },
  });
  return { uploadImageRef, isUploading, fileUploaded, uploadError };
}
