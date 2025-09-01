import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  VenuesRequestParams,
  VenuesResponse,
  getVenues,
} from '../../../services/apiVenues';

export function useVenues({
  sort,
  filters,
  pagination,
  favouriteVenues,
}: VenuesRequestParams) {
  const pageNumber = pagination?.pageNumber ?? 1;
  const maxResults = pagination?.maxResults ?? 10;

  const queryClient = useQueryClient();

  const { error, isLoading, data } = useQuery<VenuesResponse>({
    queryKey: ['venues', filters, sort, pagination, favouriteVenues],
    queryFn: () => getVenues({ filters, sort, pagination, favouriteVenues }),
    placeholderData: keepPreviousData,
  });

  const venues = data?.data;
  const totalCount = data?.count || 0;

  const pageCount = Math.ceil(totalCount / maxResults);

  if (pageNumber < pageCount) {
    const next = { pageNumber: pageNumber + 1, maxResults };
    queryClient.prefetchQuery({
      queryKey: ['venues', filters, sort, next, favouriteVenues],
      queryFn: () =>
        getVenues({ filters, sort, pagination: next, favouriteVenues }),
    });
  }
  if (pageNumber > 1) {
    const prev = { pageNumber: pageNumber - 1, maxResults };
    queryClient.prefetchQuery({
      queryKey: ['venues', filters, sort, prev, favouriteVenues],
      queryFn: () =>
        getVenues({ filters, sort, pagination: prev, favouriteVenues }),
    });
  }

  return { error, isLoading, venues, totalCount };
}
