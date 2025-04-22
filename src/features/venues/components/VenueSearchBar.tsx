import { Button, Input } from "@heroui/react";
import styles from '../styles/SearchAndFilterPanel.module.css';
import { useState } from 'react';

function VenueSearchBar({ useVenueContext }) {
  const { updateVenueFilter, removeVenueFilter } = useVenueContext();
  const [searchValue, setSearchValue] = useState('');

  function handleSumbit(e) {
    e.preventDefault();
    const formattedSearchValue = `%${searchValue}%`;
    console.log(searchValue);
    updateVenueFilter({
      field: 'venueName',
      value: formattedSearchValue,
      method: 'ilike',
    });
  }
  function clearSearch() {
    setSearchValue('');
    removeVenueFilter('venueName');
  }
  return (
    <form onSubmit={handleSumbit}>
      <Input
        onValueChange={(value) => setSearchValue(value)}
        value={searchValue}
        placeholder="Search by venue name"
      />
      <div className={`${styles.searchBarButton}`}>
        <Button onClick={clearSearch}>Clear</Button>
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
}

export default VenueSearchBar;
