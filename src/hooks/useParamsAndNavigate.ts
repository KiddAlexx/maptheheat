import { useLocation, useNavigate } from 'react-router-dom';

export function useParamsAndNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  function setParamsAndNavigate(venue, specifiedMode?) {
    if (!venue) return;

    const { city, venueName, id, lat, lng } = venue;

    // Determine the current mode based on URL path
    const mode = specifiedMode
      ? specifiedMode
      : location.pathname.includes('map')
      ? 'map'
      : 'venue';

    // Construct the query string
    let queryString = `id=${id}`;
    if (mode === 'map' && lat != null && lng != null) {
      queryString += `&lat=${lat}&lng=${lng}`;
    }

    navigate(`/app/${mode}/${city}/${venueName}?${queryString}`);
  }
  return setParamsAndNavigate;
}
