import { useMutation } from '@tanstack/react-query';

import { createUniqueCityApi } from '../../../services/apiVenues';

export function useCreateUniqueCity() {
  const { mutateAsync: createUniqueCity, isPending: isCreating } = useMutation({
    mutationFn: createUniqueCityApi,
  });
  return { isCreating, createUniqueCity };
}
