import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast/headless';
import { createRestaurant as createRestaurantApi } from '../../services/apiRestaurants';

export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  const { mutate: createRestaurant, isPending: isCreating } = useMutation({
    mutationFn: createRestaurantApi,
    onSuccess: () => {
      toast.success('New restaurant successfully created');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: (err) => {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });
  return { isCreating, createRestaurant };
}
