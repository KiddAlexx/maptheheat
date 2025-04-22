import { Pagination } from "@heroui/react";
import { useVenues } from '../hooks/useVenues';

function VenuePagination({ useVenueContext, favouriteVenues }) {
  const { pagination, filters, updatePageNumber } = useVenueContext();
  const { pageNumber, maxResults } = pagination;
  const { totalCount } = useVenues({ filters, favouriteVenues });
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
