import { useVenueFilterContext } from '@/context/VenueFilterContext';
import { Pagination } from '@nextui-org/react';
import { useVenues } from '../hooks/useVenues';

function VenuePagination() {
  const { pagination, filters, updatePageNumber } = useVenueFilterContext();
  const { pageNumber, maxResults } = pagination;
  const { totalCount } = useVenues(filters);
  const pageCount = Math.ceil(totalCount / maxResults);

  return (
    <>
      <Pagination
        showControls
        total={pageCount}
        initialPage={1}
        page={pageNumber}
        onChange={updatePageNumber}
      />
    </>
  );
}

export default VenuePagination;
