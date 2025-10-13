import { useMatch, useNavigate } from 'react-router-dom';
import { Venue } from '../types/venueTypes';

export function useParamsAndNavigate() {
  const navigate = useNavigate();
  const isOnMapRoute = useMatch('/app/map/*');

  function setParamsAndNavigate(venue: Venue, specifiedMode?: string) {
    if (!venue) return;

    const { city, venueNameSlug, venueId, coords } = venue;
    const { lat, lon } = coords;

    // Determine the current mode based on URL path
    const mode = specifiedMode ? specifiedMode : isOnMapRoute ? 'map' : 'venue';

    // Construct the query string
    let queryString = '';
    if (lat != null && lon != null) {
      queryString += `&lat=${lat}&lon=${lon}`;
    }

    navigate(`/app/${mode}/${city}/${venueNameSlug}/${venueId}?${queryString}`);
  }
  return setParamsAndNavigate;
}
