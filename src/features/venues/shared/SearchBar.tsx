// React imports
import { useState } from 'react';

// Type imports
import { VenueFormProps } from '../../layout/SideBar';

// Style imports
import styles from './SearchBar.module.css';

function SearchBar({ setIsAddingVenue }: VenueFormProps) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <>
      <form>
        <input
          className={styles.searchBarInput}
          placeholder="Search by restaurant name" /* Dynamically change to shop later */
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

        <button
          onClick={() => {
            //Used in Sidebar to conditionally render VenueForm when set to true
            setIsAddingVenue(true);
          }}
          className={` ${styles.btnAddNewVenue}`}
        >
          Add new restaurant!
        </button>
      </div>
    </>
  );
}

export default SearchBar;
