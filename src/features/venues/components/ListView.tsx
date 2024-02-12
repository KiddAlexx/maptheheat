// React imports

// Style imports
import styles from '../styles/ListView.module.css';

// Hooks imports
import { useVenues } from '../hooks/useVenues';
import { useParamsAndNavigate } from '../../../hooks/useParamsAndNavigate';

// Component imports
import ListItem from './ListItem';
import LoaderSpinner from '../../../ui/LoaderSpinner';

function ListView() {
  // Load venues from supabase
  const { venues, isLoading: isLoadingVenues } = useVenues();

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
          key={venue.id}
        />
      ))}
    </div>
  );
}

export default ListView;
