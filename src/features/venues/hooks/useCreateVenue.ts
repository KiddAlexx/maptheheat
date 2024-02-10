import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createVenue as createVenueApi } from '../../../services/apiVenues';

export function useCreateVenue() {
  const queryClient = useQueryClient();

  const { mutate: createVenue, isPending: isCreating } = useMutation({
    mutationFn: createVenueApi,
    onSuccess: () => {
      toast.success('New venue successfully created');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
  return { isCreating, createVenue };
}
