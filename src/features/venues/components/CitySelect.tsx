import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { useUniqueCities } from '../hooks/useUniqueCities';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { useLocation, useNavigate } from 'react-router';
import { useUserCities } from '../hooks/useUserCities';
import { VenueFilterContextType } from '@/context/VenueFilterContext';

interface VenueFilterProps {
  useVenueContext: () => VenueFilterContextType;
  favouriteVenues?: string[];
}

function CitySelect({ useVenueContext, favouriteVenues }: VenueFilterProps) {
  const { uniqueCities, isPending: isPendingCities } = useUniqueCities();
  const { isLoading: isLoadingUserCities, userCities } =
    useUserCities(favouriteVenues);
  const { updateVenueFilter, removeVenueFilter } = useVenueContext();
  const navigate = useNavigate();

  const location = useLocation();
  const isUserMode = location.pathname === '/profile/venues';

  let finalCityList;
  isUserMode ? (finalCityList = userCities) : (finalCityList = uniqueCities);

  console.log('here is the final city list', finalCityList);

  async function handleSelectCity(value) {
    if (!finalCityList) return;
    const selectedCityObj = await finalCityList.find(
      (cityObj) => cityObj.id == value
    );
    const { city, coords, country } = selectedCityObj;

    updateVenueFilter({ field: 'city', value: city, method: 'eq' });
    updateVenueFilter({ field: 'country', value: country, method: 'eq' });
    removeVenueFilter('venueName');
    if (!isUserMode) {
      navigate(`/app/map/${city}?&lat=${coords.lat}&lon=${coords.lon}`);
    }
  }

  return isPendingCities || isLoadingUserCities ? (
    <LoaderSpinner />
  ) : (
    <Autocomplete
      placeholder="Select City"
      aria-label="city"
      radius="sm"
      /* onInputChange={handleSelectCity} */
      onSelectionChange={handleSelectCity}
    >
      {finalCityList!.map((cityObj) => (
        // Using city + index as key for uniqueness in case of duplicate city names
        <AutocompleteItem key={cityObj.id}>
          {`${cityObj.city} - ${cityObj.country}`}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}

export default CitySelect;
