import { useVenueFilterContext } from '@/context/VenueFilterContext';
import SearchAndFilterPanel from './SearchAndFilterPanel';
import ListView from './VenueListView';
import { useUserFavVenuesContext } from '@/context/UserFavVenuesContext';
import { useLayoutEffect, useRef } from 'react';

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

  const { pagination } = useVenueContext();
  const venueScrollRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    venueScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pagination.pageNumber]);

  return (
    <div
      ref={venueScrollRef}
      className="h-full overflow-y-scroll  [-ms-overflow-style:none]  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <SearchAndFilterPanel
        useVenueContext={useVenueContext}
        favouriteVenues={mode === 'user' ? favouriteVenues : undefined}
      />

      <ListView
        useVenueContext={useVenueContext}
        favouriteVenues={
          mode === 'user' ? favouriteVenues ?? undefined : undefined
        }
      />
    </div>
  );
}

export default VenueListContainer;
