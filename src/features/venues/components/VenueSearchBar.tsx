import { useState } from 'react';
import styles from '../styles/SearchBar.module.css';

function VenueSearchBar() {
  const [searchValue, setSearchValue] = useState('');
  return (
    <form>
      <input
        className={styles.searchBarInput}
        placeholder="Search by city"
        type="text"
        name="searchValue"
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <button type="submit" className={`${styles.searchBarButton} btn-default`}>
        Search
      </button>
    </form>
  );
}

export default VenueSearchBar;
