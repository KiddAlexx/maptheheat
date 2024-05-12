import { useState } from 'react';
import styles from '../styles/SearchBar.module.css';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useVenueFilterContext } from '@/context/VenueFilterContext';

function VenueSearchBar() {
  const cities = ['Berlin', 'Barcelona'];
  const [selectedCity, setSelectedCity] = useState('');

  const handleSelectCity = (value) => {
    setSelectedCity(value);
  };
  const { updateVenueFilter } = useVenueFilterContext();

  function handleSubmit(e) {
    e.preventDefault();
    updateVenueFilter({ field: 'city', value: selectedCity, method: 'eq' });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Autocomplete
        placeholder="Search by city"
        aria-label="city"
        radius="sm"
        value={selectedCity}
        onInputChange={handleSelectCity}
        onSelectionChange={handleSelectCity}
      >
        {cities.map((city, index) => (
          // Using city + index as key for uniqueness in case of duplicate city names
          <AutocompleteItem key={`${city}-${index}`}>{city}</AutocompleteItem>
        ))}
      </Autocomplete>
      <button type="submit" className={`${styles.searchBarButton} btn-default`}>
        Search
      </button>
    </form>
  );
}

export default VenueSearchBar;
