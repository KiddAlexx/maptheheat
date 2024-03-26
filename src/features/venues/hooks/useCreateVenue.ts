import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createVenue as createVenueApi } from '../../../services/apiVenues';

export function useCreateVenue() {
  const queryClient = useQueryClient();

  const { mutateAsync: createVenue, isPending: isCreating } = useMutation({
    mutationFn: createVenueApi,
    onSuccess: () => {
      toast.success('New venue successfully created');
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return { isCreating, createVenue };
}
