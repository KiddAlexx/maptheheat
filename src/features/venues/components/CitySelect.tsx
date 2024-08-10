import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useUniqueCities } from '../hooks/useUniqueCities';
import LoaderSpinner from '@/ui/LoaderSpinner';

function CitySelect({ useVenueContext }) {
  const { uniqueCities, isPending: isPendingCities } = useUniqueCities();
  const { updateVenueFilter, removeVenueFilter } = useVenueContext();

  console.log('Heres the unique cities', uniqueCities);

  async function handleSelectCity(value) {
    if (!uniqueCities) return;
    const selectedCityObj = await uniqueCities.find(
      (cityObj) => cityObj.id == value
    );
    const { city, coords, country } = selectedCityObj;

    updateVenueFilter({ field: 'city', value: city, method: 'eq' });
    updateVenueFilter({ field: 'country', value: country, method: 'eq' });
    removeVenueFilter('venueName');
  }

  return isPendingCities ? (
    <LoaderSpinner />
  ) : (
    <Autocomplete
      placeholder="Select City"
      aria-label="city"
      radius="sm"
      /* onInputChange={handleSelectCity} */
      onSelectionChange={handleSelectCity}
    >
      {uniqueCities!.map((cityObj) => (
        // Using city + index as key for uniqueness in case of duplicate city names
        <AutocompleteItem key={cityObj.id}>
          {`${cityObj.city} - ${cityObj.country}`}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}

export default CitySelect;
