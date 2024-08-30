import {
  updateFavouriteVenue as updateFavouriteVenueApi,
  AddFavouriteVenueParams,
} from '@/services/apiUserProfiles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export function useUpdateFavouriteVenue() {
  const queryClient = useQueryClient();

  const { mutate: updateFavouriteVenue, isPending: isUpdating } = useMutation({
    mutationFn: ({ venueId, userId }: AddFavouriteVenueParams) =>
      updateFavouriteVenueApi({ venueId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['userCities'] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  return { isUpdating, updateFavouriteVenue };
}
