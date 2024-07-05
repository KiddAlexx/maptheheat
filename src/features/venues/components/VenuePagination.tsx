import { useVenueFilterContext } from '@/context/VenueFilterContext';
import { Pagination } from '@nextui-org/react';
import { useVenues } from '../hooks/useVenues';

function VenuePagination() {
  const { pagination, filters, updatePageNumber } = useVenueFilterContext();
  const { pageNumber, maxResults } = pagination;
  const { totalCount } = useVenues(filters);
  const pageCount = totalCount ? Math.ceil(totalCount / maxResults) : 0;

  if (pageCount <= 1) {
    return null;
  }

  return (
    <Pagination
      showControls
      total={pageCount}
      initialPage={1}
      page={pageNumber}
      onChange={updatePageNumber}
    />
  );
}

export default VenuePagination;
