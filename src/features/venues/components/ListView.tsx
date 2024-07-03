// React imports

// Style imports
import styles from '../styles/ListView.module.css';

// Hooks imports
import { useVenues } from '../hooks/useVenues';
import { useParamsAndNavigate } from '../../../hooks/useParamsAndNavigate';

// Component imports
import ListItem from './ListItem';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { useVenueFilterContext } from '@/context/VenueFilterContext';
import VenuePagination from './VenuePagination';

function ListView() {
  const { filters: venueFilters, sort: venueSort } = useVenueFilterContext();
  // Load venues from supabase
  const { venues, isLoading: isLoadingVenues } = useVenues(
    venueFilters,
    venueSort
  );

  const setParamsAndNavigate = useParamsAndNavigate();

  return isLoadingVenues ? (
    <LoaderSpinner />
  ) : (
    <div className={styles.listView}>
      <VenuePagination />
      {/* Map through list of venues and render ListItem component for
        each venue. Onclick set clicked venue as active venue */}
      {venues?.map((venue) => (
        <ListItem
          handleClick={() => setParamsAndNavigate(venue)}
          venue={venue}
          key={venue.venueId}
        />
      ))}
      <VenuePagination />
    </div>
  );
}

export default ListView;
