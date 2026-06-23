import { useVenueFilterContext } from '@/context/VenueFilterContext';
import SearchAndFilterPanel from './SearchAndFilterPanel';
import ListView from './VenueListView';
import { useUserFavVenuesContext } from '@/context/UserFavVenuesContext';
import { useUserAddedVenuesContext } from '@/context/UserAddedVenuesContext';
import { useLayoutEffect, useRef } from 'react';

interface VenueListContainerProps {
  mode: 'venue' | 'user' | 'added';
  favouriteVenues?: string[];
  authorUserId?: string;
}

function VenueListContainer({
  mode,
  favouriteVenues,
  authorUserId,
}: VenueListContainerProps) {
  // Assigns which context to use for pagination and sorting
  // based on mode prop
  const useVenueContext =
    mode === 'venue'
      ? useVenueFilterContext
      : mode === 'user'
        ? useUserFavVenuesContext
        : useUserAddedVenuesContext;

  // Hide the search bar and prevent map navigation on profile views
  const isUserMode = mode !== 'venue';

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
        isUserMode={isUserMode}
      />

      <ListView
        useVenueContext={useVenueContext}
        favouriteVenues={mode === 'user' ? favouriteVenues ?? undefined : undefined}
        isUserMode={isUserMode}
        authorUserId={mode === 'added' ? authorUserId : undefined}
      />
    </div>
  );
}

export default VenueListContainer;
