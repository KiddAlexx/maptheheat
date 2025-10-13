// Hooks imports
import { useVenues } from '../hooks/useVenues';
import { useParamsAndNavigate } from '../../../hooks/useParamsAndNavigate';

// Component imports
import VenueListCard from './VenueListCard';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';
import {
  useVenueFilterContext,
  VenueFilterContextType,
} from '@/context/VenueFilterContext';
import { useUIContext } from '@/context/UIContext';
import { Venue } from '@/types/venueTypes';
import { useMatch } from 'react-router';
import PaginationControls from '@/ui/PaginationControls';

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
    isLoading: isLoadingVenues,
    totalCount,
  } = useVenues({
    favouriteVenues,
    filters,
    sort,
    pagination,
  });

  const { isLargeScreen, updateView } = useUIContext();

  const {
    user,
    isLoading: isLoadingUser,
    fetchStatus,
    isAuthenticated,
  } = useUser();
  const userId = user ? user.id : null;
  const { userProfile, isLoading: isLoadingProfile } =
    useGetUserProfile(userId);

  const setParamsAndNavigate = useParamsAndNavigate();

  if (
    fetchStatus == 'fetching' ||
    isLoadingUser ||
    isLoadingProfile ||
    isLoadingVenues
  )
    return <LoaderSpinner />;

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

    updateView('venue');
  }

  const favVenuesList = userProfile?.favouriteVenues || null;

  return (
    <div className="h-full overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <PaginationControls
        updatePageNumber={updatePageNumber}
        pagination={pagination}
        totalCount={totalCount}
      />
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
      <PaginationControls
        updatePageNumber={updatePageNumber}
        pagination={pagination}
        totalCount={totalCount}
      />
    </div>
  );
}

export default ListView;
