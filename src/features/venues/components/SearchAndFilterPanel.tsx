// React imports

// Type imports

// Style imports
import styles from '../styles/SearchAndFilterPanel.module.css';
import { Link } from 'react-router-dom';
import VenueTypeFilter from './VenueTypeFilter';
import VenueSearchBar from './VenueSearchBar';
import VenueSort from './VenueSort';

function SearchAndFilterPanel({ useVenueContext }) {
  return (
    <>
      <VenueSearchBar useVenueContext={useVenueContext} />
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
