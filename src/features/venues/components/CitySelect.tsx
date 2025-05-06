import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { useUniqueCities } from '../hooks/useUniqueCities';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { useLocation, useNavigate } from 'react-router';
import { useUserCities } from '../hooks/useUserCities';
import { VenueFilterContextType } from '@/context/VenueFilterContext';
import { Key, UniqueCity } from '@/types/venueTypes';

interface VenueFilterProps {
  useVenueContext: () => VenueFilterContextType;
  favouriteVenues?: string[];
}

function CitySelect({ useVenueContext, favouriteVenues }: VenueFilterProps) {
  // Fetch unique city list from unique_cities table
  const { uniqueCities, isPending: isPendingCities } = useUniqueCities();
  // Fetch unique cities for venues in users favourite venues list
  // if favouriteVenues is present
  const { isLoading: isLoadingUserCities, userCities } = useUserCities(
    favouriteVenues ?? []
  );

  const { updateVenueFilter, removeVenueFilter } = useVenueContext();
  const navigate = useNavigate();

  // Determine "mode" based on url - used to differentiate between use
  // within profile view or map/venue view
  const location = useLocation();
  const isUserMode = location.pathname === '/profile/venues';

  // Ensure uniqueCity arrays have loaded
  if (isPendingCities || isLoadingUserCities) return;

  // Select which city list to use based on "mode"
  let finalCityList: UniqueCity[];
  isUserMode ? (finalCityList = userCities!) : (finalCityList = uniqueCities!);

  // Update venue filters based upon city selection
  async function handleSelectCity(value: Key | null) {
    if (!finalCityList) return;
    const selectedCityObj = await finalCityList.find(
      (cityObj) => cityObj.id == value
    );
    if (!selectedCityObj) return;
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
