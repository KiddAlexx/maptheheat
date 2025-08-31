/* import { Pagination } from '@heroui/react';
import { useVenues } from '../hooks/useVenues';
import { VenueFilterContextType } from '@/context/VenueFilterContext';

interface VenuePaginationProps {
  useVenueContext: () => VenueFilterContextType;
  favouriteVenues?: string[];
}

function VenuePagination({
  useVenueContext,
  favouriteVenues,
}: VenuePaginationProps) {
  const { pagination, filters, updatePageNumber } = useVenueContext();
  const { pageNumber, maxResults } = pagination;
  const { totalCount } = useVenues({ filters, favouriteVenues });
  const pageCount = totalCount ? Math.ceil(totalCount / maxResults) : 0;

  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="p-2">
      <Pagination
        showControls
        total={pageCount}
        initialPage={1}
        page={pageNumber}
        onChange={updatePageNumber}
      />
    </div>
  );
}

export default VenuePagination;
 */
