import { useLocation, useNavigate } from 'react-router-dom';
import { Venue } from '../models/venueTypes';

export function useParamsAndNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  function setParamsAndNavigate(venue: Venue, specifiedMode?: string) {
    if (!venue) return;

    const { city, urlSlug, venueId, coords } = venue;
    const { lat, lon } = coords;

    console.log(venue);

    // Determine the current mode based on URL path
    const mode = specifiedMode
      ? specifiedMode
      : location.pathname.includes('map')
      ? 'map'
      : 'venue';

    // Construct the query string
    let queryString = '';
    if (mode === 'map' && lat != null && lon != null) {
      queryString += `&lat=${lat}&lon=${lon}`;
    }

    console.log(queryString);
    console.log(`/app/${mode}/${city}/${urlSlug}/${venueId}?${queryString}`);

    navigate(`/app/${mode}/${city}/${urlSlug}/${venueId}?${queryString}`);
  }
  return setParamsAndNavigate;
}
