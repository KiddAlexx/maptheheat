// React imports
import { useState } from 'react';

// Type imports

// Style imports
import styles from '../styles/SearchBar.module.css';
import { Link } from 'react-router-dom';

function SearchBar() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <>
      <form>
        <input
          className={styles.searchBarInput}
          placeholder="Search by venue name" /* Dynamically change to shop later */
          type="text"
          name="searchValue"
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button
          type="submit"
          className={`${styles.searchBarButton} btn-default`}
        >
          Search
        </button>
      </form>
      <div className={styles.addNewContainer}>
        <p>Can't find what you are looking for?</p>

        <Link to="/add-venue" className={` ${styles.btnAddNewVenue}`}>
          Add new venue!
        </Link>
      </div>
    </>
  );
}

export default SearchBar;
