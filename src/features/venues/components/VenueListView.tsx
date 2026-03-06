// Third Party Imports
import { useMatch } from 'react-router';

// React imports

// Hooks
import { useVenues } from '../hooks/useVenues';
import { useParamsAndNavigate } from '@/hooks/useParamsAndNavigate';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';
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
}

function ListView({ useVenueContext, favouriteVenues }: ListViewProps) {
  const { filters, sort, pagination, updatePageNumber } = useVenueContext();
  const { updateVenueFilter } = useVenueFilterContext();
  const isUserMode = useMatch('/profile/venues');
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
  });

  const { isLargeScreen } = useUIContext();

  const {
    user,
    isPending: isPendingUser,
    isFetching,
    isAuthenticated,
  } = useUser();
  const userId = user ? user.id : null;
  const { userProfile, isLoading: isLoadingProfile } =
    useGetUserProfile(userId);

  const setParamsAndNavigate = useParamsAndNavigate();

  if (isFetching || isPendingUser || isLoadingProfile || isLoadingVenues)
    return <LoaderSpinner message="Loading venues" />;

  function handleCardClick(venue: Venue) {
    const { city, country } = venue;
    if (isUserMode) {
      updateVenueFilter({ field: 'city', value: city, method: 'eq' });
      updateVenueFilter({ field: 'country', value: country, method: 'eq' });
    }
    {
      isLargeScreen
        ? setParamsAndNavigate(venue)
        : setParamsAndNavigate(venue, 'venue');
    }
  }

  const favVenuesList = userProfile?.favouriteVenues || null;

  return (
    <>
      <div className="mb-2 flex lg:justify-center">
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
          className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-md"
        >
          <p className="mb-2 text-xl font-semibold text-gray-600">
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
              key={venue.venueId}
            />
          ))}
        </ul>
      )}

      <div className="mb-2 flex lg:justify-center">
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
