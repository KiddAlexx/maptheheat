// Third Party Imports

// React imports

// Hooks
import { useVenues } from '../hooks/useVenues';
import { useParamsAndNavigate } from '@/hooks/useParamsAndNavigate';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useGetMyFavourites } from '@/features/userProfile/hooks/useGetMyFavourites';
import {
  useVenueFilterContext,
  VenueFilterContextType,
} from '@/context/VenueFilterContext';
import { useUIContext } from '@/context/UIContext';

// Assets

// Components
import VenueListCard from './VenueListCard';
import LoaderSpinner from '@/ui/LoaderSpinner';
import PaginationControls from '@/ui/PaginationControls';

// Type imports
import type { Venue } from '@/types/venueTypes';

interface ListViewProps {
  useVenueContext: () => VenueFilterContextType;
  favouriteVenues?: string[];
  isUserMode?: boolean;
  authorUserId?: string;
}

function ListView({ useVenueContext, favouriteVenues, isUserMode, authorUserId }: ListViewProps) {
  const { filters, sort, pagination, updatePageNumber } = useVenueContext();
  const { updateVenueFilter } = useVenueFilterContext();
  // Load venues from supabase
  const {
    venues,
    isPending: isLoadingVenues,
    totalCount,
  } = useVenues({
    favouriteVenues,
    filters,
    sort,
    pagination,
    authorUserId,
  });

  const { isLargeScreen } = useUIContext();

  const {
    user,
    isPending: isPendingUser,
    isFetching,
    isAuthenticated,
  } = useUser();
  const userId = user ? user.id : null;
  const { myFavourites: favVenuesList, isLoading: isLoadingFavourites } =
    useGetMyFavourites(userId);

  const setParamsAndNavigate = useParamsAndNavigate();

  if (isFetching || isPendingUser || isLoadingFavourites || isLoadingVenues)
    return <LoaderSpinner message="Loading venues" />;

  function handleCardClick(venue: Venue) {
    const { city, country } = venue;
    if (isUserMode) {
      updateVenueFilter({ field: 'city', value: city, method: 'eq' });
      updateVenueFilter({ field: 'country', value: country, method: 'eq' });
    }
    if (isLargeScreen) {
      setParamsAndNavigate(venue);
      return;
    }

    setParamsAndNavigate(venue, 'venue');
  }

  return (
    <>
      <div className="mb-4 flex justify-center">
        <PaginationControls
          updatePageNumber={updatePageNumber}
          pagination={pagination}
          totalCount={totalCount}
        />
      </div>
      {venues?.length === 0 ? (
        <div
          role="alert"
          aria-live="polite"
          className="border-app-border bg-app-card rounded-xl border p-6 text-center shadow-md"
        >
          <p className="text-app-muted mb-2 text-xl font-semibold">
            No venues found, please adjust filters
          </p>
        </div>
      ) : (
        <ul>
          {/* Map through list of venues and render ListItem component for
        each venue. Onclick set clicked venue as active venue */}
          {venues?.map((venue) => (
            <VenueListCard
              handleClick={() => handleCardClick(venue)}
              venue={venue}
              userId={userId}
              isAuthenticated={isAuthenticated}
              favVenuesList={favVenuesList}
              isUserMode={isUserMode}
              key={venue.venueId}
            />
          ))}
        </ul>
      )}

      <div className="mb-2 mt-4 flex justify-center">
        <PaginationControls
          updatePageNumber={updatePageNumber}
          pagination={pagination}
          totalCount={totalCount}
        />
      </div>
    </>
  );
}

export default ListView;
