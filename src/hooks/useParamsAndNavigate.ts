import { useMatch, useNavigate } from 'react-router-dom';
import type { Venue } from '../types/venueTypes';

type AppMode = 'venue' | 'map';

export function useParamsAndNavigate() {
  const navigate = useNavigate();
  const isOnMapRoute = useMatch('/app/map/*');

  function setParamsAndNavigate(venue: Venue, specifiedMode?: AppMode) {
    if (!venue) return;

    const { city, country, venueNameSlug, venueId, coords } = venue;
    const { lat, lon } = coords;

    // Determine the current mode based on URL path
    const mode = specifiedMode ? specifiedMode : isOnMapRoute ? 'map' : 'venue';

    // Map navigations also carry the one-shot popup-open request in location state.
    const queryParams = new URLSearchParams();
    if (mode === 'map') {
      queryParams.set('pane', 'map');
    }
    if (lat != null && lon != null) {
      queryParams.set('lat', String(lat));
      queryParams.set('lon', String(lon));
    }

    const queryString = queryParams.toString();
    const destination = `/app/${mode}/${city}/${country}/${venueNameSlug}/${venueId}${queryString ? `?${queryString}` : ''}`;

    if (mode === 'map') {
      navigate(destination, { state: { openPopupFor: venueId } });
      return;
    }

    navigate(destination);
  }
  return setParamsAndNavigate;
}
