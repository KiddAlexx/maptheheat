import { useState } from 'react';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useUniqueCities } from '../hooks/useUniqueCities';
import LoaderSpinner from '@/ui/LoaderSpinner';

function CitySelect({ useVenueContext }) {
  const [selectedCity, setSelectedCity] = useState('');

  const { uniqueCities, error, isPending: isPendingCities } = useUniqueCities();
  const { updateVenueFilter } = useVenueContext();

  const handleSelectCity = (value) => {
    setSelectedCity(value);
    console.log(selectedCity);
    updateVenueFilter({ field: 'city', value: value, method: 'eq' });
  };

  return isPendingCities ? (
    <LoaderSpinner />
  ) : (
    <form>
      <Autocomplete
        placeholder="Select City"
        aria-label="city"
        radius="sm"
        inputValue={selectedCity}
        onInputChange={handleSelectCity}
        /* onSelectionChange={handleSelectCity} */
      >
        {uniqueCities!.map((city, index) => (
          // Using city + index as key for uniqueness in case of duplicate city names
          <AutocompleteItem key={index}>{city}</AutocompleteItem>
        ))}
      </Autocomplete>
    </form>
  );
}

export default CitySelect;
