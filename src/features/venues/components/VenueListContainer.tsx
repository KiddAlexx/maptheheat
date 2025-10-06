import { useVenueFilterContext } from '@/context/VenueFilterContext';
import SearchAndFilterPanel from './SearchAndFilterPanel';
import ListView from './VenueListView';
import { useUserFavVenuesContext } from '@/context/UserFavVenuesContext';

import { useVenues } from '../hooks/useVenues';
import PaginationControls from '@/ui/PaginationControls';
import AddVenueButton from '@/ui/AddVenueButton';

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
      <div className="rounded-xl bg-zinc-200 p-3">
        <SearchAndFilterPanel
          useVenueContext={useVenueContext}
          favouriteVenues={mode === 'user' ? favouriteVenues : undefined}
        />
        {mode === 'venue' && (
          <div className="mt-3 flex items-center justify-end text-sm">
            <AddVenueButton />
          </div>
        )}
      </div>

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
