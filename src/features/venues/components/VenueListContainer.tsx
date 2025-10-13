import { useVenueFilterContext } from '@/context/VenueFilterContext';
import SearchAndFilterPanel from './SearchAndFilterPanel';
import ListView from './VenueListView';
import { useUserFavVenuesContext } from '@/context/UserFavVenuesContext';

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

  return (
    <>
      <div className="mb-2 rounded-xl bg-zinc-200 p-3">
        <SearchAndFilterPanel
          useVenueContext={useVenueContext}
          favouriteVenues={mode === 'user' ? favouriteVenues : undefined}
        />
      </div>

      <ListView
        useVenueContext={useVenueContext}
        favouriteVenues={
          mode === 'user' ? favouriteVenues ?? undefined : undefined
        }
      />
    </>
  );
}

export default VenueListContainer;
