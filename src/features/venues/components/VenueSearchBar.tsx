import { useState } from 'react';
import styles from '../styles/SearchBar.module.css';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useVenueFilterContext } from '@/context/VenueFilterContext';
import { useUniqueCities } from '../hooks/useUniqueCities';
import LoaderSpinner from '@/ui/LoaderSpinner';

function VenueSearchBar() {
  const [selectedCity, setSelectedCity] = useState('');

  const { uniqueCities, error, isPending: isPendingCities } = useUniqueCities();

  const handleSelectCity = (value) => {
    setSelectedCity(value);
  };
  const { updateVenueFilter } = useVenueFilterContext();

  function handleSubmit(e) {
    e.preventDefault();
    updateVenueFilter({ field: 'city', value: selectedCity, method: 'eq' });
  }

  return isPendingCities ? (
    <LoaderSpinner />
  ) : (
    <form onSubmit={handleSubmit}>
      <Autocomplete
        placeholder="Search by city"
        aria-label="city"
        radius="sm"
        value={selectedCity}
        onInputChange={handleSelectCity}
        onSelectionChange={handleSelectCity}
      >
        {uniqueCities!.map((city, index) => (
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
