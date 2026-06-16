import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVenueFilterContext } from '@/context/VenueFilterContext';

// Keeps the venue filter context's city/country in sync with the city/country
// in the URL — the source of truth for the location currently being viewed.
//
// The filter is otherwise only set via CitySelect, so reaching a venue in a
// different city by any other route (homepage link, map marker, direct URL)
// leaves the filter — and therefore the CitySelect and venue list — stuck on
// the previously selected city. Call this from the route components that own
// the :city/:country params (MapView, DetailedVenueView).
export function useSyncCityFilterFromParams() {
  const { city, country } = useParams<{ city?: string; country?: string }>();
  const { updateVenueFilter } = useVenueFilterContext();

  useEffect(() => {
    if (city) updateVenueFilter({ field: 'city', value: city, method: 'eq' });
    if (country) updateVenueFilter({ field: 'country', value: country, method: 'eq' });
  }, [city, country, updateVenueFilter]);
}
