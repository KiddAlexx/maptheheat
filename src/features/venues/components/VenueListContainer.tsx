import { useVenueFilterContext } from '@/context/VenueFilterContext';
import SearchAndFilterPanel from './SearchAndFilterPanel';
import ListView from './VenueListView';
import { useUserFavVenuesContext } from '@/context/UserFavVenuesContext';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';
import { useVenues } from '../hooks/useVenues';
import PaginationControls from '@/ui/PaginationControls';

interface VenueListContainerProps {
  mode: 'venue' | 'user';
  favouriteVenues?: string[];
}

function VenueListContainer({
  mode,
  favouriteVenues,
}: VenueListContainerProps) {
  // Assigns which context to use for pagination and sorting
  // based on mode prop
  const useVenueContext =
    mode === 'venue' ? useVenueFilterContext : useUserFavVenuesContext;

  const { pagination, filters, updatePageNumber } = useVenueContext();

  const { totalCount } = useVenues({
    filters,
    favouriteVenues: mode === 'user' ? favouriteVenues : undefined,
  });

  return (
    <>
      <SearchAndFilterPanel
        useVenueContext={useVenueContext}
        favouriteVenues={mode === 'user' ? favouriteVenues : undefined}
      />
      {mode === 'venue' && (
        <div className=" my-2 flex items-center justify-between p-1">
          <p>Can't find what you are looking for?</p>
          <Button as={Link} to="/add-venue" radius="sm">
            Add new venue!
          </Button>
        </div>
      )}

      <PaginationControls
        updatePageNumber={updatePageNumber}
        pagination={pagination}
        totalCount={totalCount}
      />

      <ListView
        useVenueContext={useVenueContext}
        favouriteVenues={
          mode === 'user' ? favouriteVenues ?? undefined : undefined
        }
      />

      <PaginationControls
        updatePageNumber={updatePageNumber}
        pagination={pagination}
        totalCount={totalCount}
      />
    </>
  );
}

export default VenueListContainer;
