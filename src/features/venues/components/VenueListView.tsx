// React imports

// Style imports
import styles from '../styles/ListView.module.css';

// Hooks imports
import { useVenues } from '../hooks/useVenues';
import { useParamsAndNavigate } from '../../../hooks/useParamsAndNavigate';

// Component imports
import ListItem from './VenueListItem';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { useUser } from '@/features/authentication/useUser';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';

function ListView({ useVenueContext, favouriteVenues }) {
  const { filters, sort, pagination } = useVenueContext();
  // Load venues from supabase
  const { venues, isLoading: isLoadingVenues } = useVenues({
    favouriteVenues,
    filters,
    sort,
    pagination,
  });

  const { user, isLoading: isLoadingUser, fetchStatus } = useUser();
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
    <div className={styles.listView}>
      {/* Map through list of venues and render ListItem component for
        each venue. Onclick set clicked venue as active venue */}
      {venues?.map((venue) => (
        <ListItem
          handleClick={() => setParamsAndNavigate(venue)}
          venue={venue}
          userId={userId}
          favVenuesList={favVenuesList}
          key={venue.venueId}
        />
      ))}
    </div>
  );
}

export default ListView;
