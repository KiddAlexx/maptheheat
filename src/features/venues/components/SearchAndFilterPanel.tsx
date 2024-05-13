// React imports

// Type imports

// Style imports
import styles from '../styles/SearchBar.module.css';
import { Link } from 'react-router-dom';
import VenueTypeFilter from './VenueTypeFilter';
import VenueSearchBar from './VenueSearchBar';

function SearchAndFilterPanel() {
  return (
    <>
      <VenueSearchBar />
      <VenueTypeFilter />

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
