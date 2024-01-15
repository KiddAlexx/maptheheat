import { useLocation, useNavigate } from 'react-router-dom';

export function useParamsAndNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  function setParamsAndNavigate(venue, specifiedMode?) {
    if (!venue) return;

    const { city, urlSlug, id, lat, lng } = venue;

    console.log(venue);

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

    console.log(queryString);
    console.log(`/app/${mode}/${city}/${urlSlug}?${queryString}`);

    navigate(`/app/${mode}/${city}/${urlSlug}?${queryString}`);
  }
  return setParamsAndNavigate;
}
