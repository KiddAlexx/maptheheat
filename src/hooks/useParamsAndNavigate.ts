import { useLocation, useNavigate } from 'react-router-dom';
import { Restaurant } from '../models/restaurantTypes';

export function useParamsAndNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  function setParamsAndNavigate(venue: Restaurant, specifiedMode?: string) {
    if (!venue) return;

    const { city, urlSlug, id, coords } = venue;
    const { lat, lon } = coords;

    console.log(venue);

    // Determine the current mode based on URL path
    const mode = specifiedMode
      ? specifiedMode
      : location.pathname.includes('map')
      ? 'map'
      : 'venue';

    // Construct the query string
    let queryString = `id=${id}`;
    if (mode === 'map' && lat != null && lon != null) {
      queryString += `&lat=${lat}&lon=${lon}`;
    }

    console.log(queryString);
    console.log(`/app/${mode}/${city}/${urlSlug}?${queryString}`);

    navigate(`/app/${mode}/${city}/${urlSlug}?${queryString}`);
  }
  return setParamsAndNavigate;
}
