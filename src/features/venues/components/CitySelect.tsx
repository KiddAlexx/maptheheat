// Third Party Imports
import { useNavigate } from 'react-router';

// Hooks
import { useUniqueCities } from '../hooks/useUniqueCities';
import { useUserCities } from '../hooks/useUserCities';

// Components
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import LoaderSpinner from '@/ui/LoaderSpinner';

// Utils
import { getFilterValue } from '../utils/getFilterValue';

// Type imports
import type { VenueFilterContextType } from '@/context/VenueFilterContext';
import type { Key, UniqueCity } from '@/types/venueTypes';

interface VenueFilterProps {
  useVenueContext: () => VenueFilterContextType;
  favouriteVenues?: string[];
  isUserMode?: boolean;
}

function CitySelect({ useVenueContext, favouriteVenues, isUserMode }: VenueFilterProps) {
  // Fetch unique city list from unique_cities table
  const { uniqueCities, isPending: isPendingCities } = useUniqueCities();
  // Fetch unique cities for venues in users favourite venues list
  // if favouriteVenues is present
  const { isLoading: isLoadingUserCities, userCities } =
    useUserCities(favouriteVenues);

  const { filters, updateVenueFilter, removeVenueFilter } = useVenueContext();
  const navigate = useNavigate();

  // Ensure uniqueCity arrays have loaded
  if (isPendingCities || isLoadingUserCities) return;

  // Show user-specific city list when favouriteVenues are provided;
  // otherwise show all unique cities from the database.
  let finalCityList: UniqueCity[];
  if (favouriteVenues && userCities) {
    finalCityList = [
      {
        cityId: 'ALL_KEY',
        city: 'All',
        country: 'favourites',
        coords: { lat: 0, lon: 0 },
      },
      ...userCities,
    ];
  } else {
    finalCityList = uniqueCities!;
  }

  // Derive the selected city from context (the stored value is the city name)
  // so the Autocomplete reflects the applied filter after a panel remount.
  const cityFilter = getFilterValue(filters, 'city') as string | undefined;
  const selectedKey = cityFilter
    ? finalCityList.find((cityObj) => cityObj.city === cityFilter)?.cityId ?? null
    : favouriteVenues
      ? 'ALL_KEY'
      : null;

  // Update venue filters based upon city selection
  async function handleSelectCity(value: Key | null) {
    // Displays all user favourites
    if (favouriteVenues && value === 'ALL_KEY') {
      removeVenueFilter('city');
      removeVenueFilter('country');
      return;
    }

    if (!finalCityList) return;
    const selectedCityObj = finalCityList.find(
      (cityObj) => cityObj.cityId == value
    );
    if (!selectedCityObj) return;
    const { city, coords, country } = selectedCityObj;

    updateVenueFilter({ field: 'city', value: city, method: 'eq' });
    updateVenueFilter({ field: 'country', value: country, method: 'eq' });
    removeVenueFilter('venueName');
    // Navigate to map only outside profile views
    if (!isUserMode) {
      navigate(
        `/app/map/${city}/${country}?&lat=${coords.lat}&lon=${coords.lon}`
      );
    }
  }

  return isPendingCities || isLoadingUserCities ? (
    <LoaderSpinner message="Loading" />
  ) : (
    <Autocomplete
      className="mb-3"
      placeholder="Select City"
      aria-label="city"
      radius="full"
      variant="bordered"
      /* onInputChange={handleSelectCity} */
      onSelectionChange={handleSelectCity}
      selectedKey={selectedKey}
    >
      {finalCityList.map((cityObj) => (
        // Using city + index as key for uniqueness in case of duplicate city names
        <AutocompleteItem key={cityObj.cityId}>
          {`${cityObj.city} - ${cityObj.country}`}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}

export default CitySelect;
