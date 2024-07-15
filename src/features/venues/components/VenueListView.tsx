// React imports

// Style imports
import styles from '../styles/ListView.module.css';

// Hooks imports
import { useVenues } from '../hooks/useVenues';
import { useParamsAndNavigate } from '../../../hooks/useParamsAndNavigate';

// Component imports
import ListItem from './VenueListItem';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { useVenueFilterContext } from '@/context/VenueFilterContext';

function ListView() {
  const { filters, sort, pagination } = useVenueFilterContext();
  // Load venues from supabase
  const { venues, isLoading: isLoadingVenues } = useVenues({
    filters,
    sort,
    pagination,
  });

  const setParamsAndNavigate = useParamsAndNavigate();

  return isLoadingVenues ? (
    <LoaderSpinner />
  ) : (
    <div className={styles.listView}>
      {/* Map through list of venues and render ListItem component for
        each venue. Onclick set clicked venue as active venue */}
      {venues?.map((venue) => (
        <ListItem
          handleClick={() => setParamsAndNavigate(venue)}
          venue={venue}
          key={venue.venueId}
        />
      ))}
    </div>
  );
}

export default ListView;
