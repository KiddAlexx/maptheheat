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
    queryKey: ['venues', finalFilters, sort, pagination, favouriteVenues],
    queryFn: () =>
      getVenues({ filters: finalFilters, sort, pagination, favouriteVenues }),
    placeholderData: keepPreviousData,
  });

  const venues = data?.data;
  const totalCount = data?.count || 0;

  useEffect(() => {
    const pageCount = Math.ceil(totalCount / maxResults);

    if (pageNumber < pageCount) {
      const next = { pageNumber: pageNumber + 1, maxResults };
      queryClient.prefetchQuery({
        queryKey: ['venues', finalFilters, sort, next, favouriteVenues],
        queryFn: () =>
          getVenues({
            filters: finalFilters,
            sort,
            pagination: next,
            favouriteVenues,
          }),
      });
    }

    if (pageNumber > 1) {
      const prev = { pageNumber: pageNumber - 1, maxResults };
      queryClient.prefetchQuery({
        queryKey: ['venues', finalFilters, sort, prev, favouriteVenues],
        queryFn: () =>
          getVenues({
            filters: finalFilters,
            sort,
            pagination: prev,
            favouriteVenues,
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
  ]);

  return { error, isPending, venues, totalCount };
}
