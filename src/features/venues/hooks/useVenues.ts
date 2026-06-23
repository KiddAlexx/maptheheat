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
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

export function useVenues({
  sort,
  filters = [],
  pagination,
  favouriteVenues,
  authorUserId,
}: VenuesRequestParams) {
  const { city, country } = useParams();

  const finalFilters = useMemo(() => {
    let nextFilters = [...filters];

    if (city && country) {
      nextFilters = nextFilters.filter((filter) => filter.field !== 'city');
      nextFilters.push({ field: 'city', value: city, method: 'eq' });

      nextFilters = nextFilters.filter((filter) => filter.field !== 'country');
      nextFilters.push({ field: 'country', value: country, method: 'eq' });
    }

    return nextFilters;
  }, [filters, city, country]);

  const pageNumber = pagination?.pageNumber ?? 1;
  const maxResults = pagination?.maxResults ?? 10;

  const queryClient = useQueryClient();

  const { error, isPending, data } = useQuery<VenuesResponse>({
    queryKey: ['venues', finalFilters, sort, pagination, favouriteVenues, authorUserId],
    queryFn: () =>
      getVenues({ filters: finalFilters, sort, pagination, favouriteVenues, authorUserId }),
    placeholderData: keepPreviousData,
  });

  const venues = data?.data;
  const totalCount = data?.count || 0;

  useEffect(() => {
    const pageCount = Math.ceil(totalCount / maxResults);

    if (pageNumber < pageCount) {
      const next = { pageNumber: pageNumber + 1, maxResults };
      queryClient.prefetchQuery({
        queryKey: ['venues', finalFilters, sort, next, favouriteVenues, authorUserId],
        queryFn: () =>
          getVenues({
            filters: finalFilters,
            sort,
            pagination: next,
            favouriteVenues,
            authorUserId,
          }),
      });
    }

    if (pageNumber > 1) {
      const prev = { pageNumber: pageNumber - 1, maxResults };
      queryClient.prefetchQuery({
        queryKey: ['venues', finalFilters, sort, prev, favouriteVenues, authorUserId],
        queryFn: () =>
          getVenues({
            filters: finalFilters,
            sort,
            pagination: prev,
            favouriteVenues,
            authorUserId,
          }),
      });
    }
  }, [
    queryClient,
    pageNumber,
    maxResults,
    totalCount,
    finalFilters,
    filters,
    sort,
    favouriteVenues,
    authorUserId,
  ]);

  return { error, isPending, venues, totalCount };
}
