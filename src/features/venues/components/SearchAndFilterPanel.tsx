// React imports

// Type imports

// Style imports
import styles from '../styles/SearchAndFilterPanel.module.css';
import { Link, useLocation } from 'react-router-dom';
import VenueTypeFilter from './VenueTypeFilter';
import CitySelect from './CitySelect';
import VenueSort from './VenueSort';
import VenueSearchBar from './VenueSearchBar';

function SearchAndFilterPanel({ useVenueContext }) {
  const location = useLocation();
  const isUserMode = location.pathname === '/profile/venues';
  return (
    <>
      {!isUserMode && <VenueSearchBar useVenueContext={useVenueContext} />}
      <CitySelect useVenueContext={useVenueContext} />
      <div className={styles.filterSortWrapper}>
        <VenueTypeFilter useVenueContext={useVenueContext} />
        <VenueSort useVenueContext={useVenueContext} />
      </div>

      <div className={styles.addNewContainer}>
        <p>Can't find what you are looking for?</p>

        <Link to="/add-venue" className={` ${styles.btnAddNewVenue}`}>
          Add new venue!
        </Link>
      </div>
    </>
  );
}

export default SearchAndFilterPanel;
