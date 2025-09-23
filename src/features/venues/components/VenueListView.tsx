// Hooks imports
import { useVenues } from '../hooks/useVenues';
import { useParamsAndNavigate } from '../../../hooks/useParamsAndNavigate';

// Component imports
import ListItem from './VenueListItem';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';
import { VenueFilterContextType } from '@/context/VenueFilterContext';
import { useUIContext } from '@/context/UIContext';

interface ListViewProps {
  useVenueContext: () => VenueFilterContextType;
  favouriteVenues?: string[];
}

function ListView({ useVenueContext, favouriteVenues }: ListViewProps) {
  const { filters, sort, pagination } = useVenueContext();
  // Load venues from supabase
  const { venues, isLoading: isLoadingVenues } = useVenues({
    favouriteVenues,
    filters,
    sort,
    pagination,
  });

  const { isLargeScreen } = useUIContext();

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

  const favVenuesList = userProfile?.favouriteVenues || null;

  return (
    <ul className="h-full overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Map through list of venues and render ListItem component for
        each venue. Onclick set clicked venue as active venue */}
      {venues?.map((venue) => (
        <ListItem
          handleClick={
            isLargeScreen
              ? () => setParamsAndNavigate(venue)
              : () => setParamsAndNavigate(venue, 'venue')
          }
          venue={venue}
          userId={userId}
          isAuthenticated={isAuthenticated}
          favVenuesList={favVenuesList}
          key={venue.venueId}
        />
      ))}
    </ul>
  );
}

export default ListView;
