// React imports
import { useNavigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Style imports
import styles from './ListView.module.css';

// Hooks imports
import { useRestaurants as useRestaurantsContext } from '../context/RestaurantContext';

// Component imports
import ListItem from './ListItem';
import LoaderSpinner from './LoaderSpinner';
import { useRestaurants } from '../features/restaurants/useRestaurants';

function ListView() {
  const { setActiveRestaurant, activeRestaurant, isLoading } =
    useRestaurantsContext();

  // Load restaurants from supabase
  const {
    restaurants,
    error,
    isLoading: isLoadingRestaurants,
  } = useRestaurants();

  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  // Determine the mode based on the current URL path
  const mode = location.pathname.includes('map') ? 'map' : 'venue';

  function setRestaurantParams(restaurant) {
    const params = {
      city: restaurant.city,
      venue: restaurant.urlSlug,
      id: restaurant.id,
    };

    if (mode === 'map') {
      params.lat = restaurant.lat;
      params.lng = restaurant.lng;
    }

    setSearchParams(params);
  }

  // If mode is 'venue' and there's an active restaurant with city and urlSlug values,
  // navigate to the detailed page of the active restaurant.
  /*   useEffect(() => {
    if (
      mode === 'venue' &&
      activeRestaurant?.city &&
      activeRestaurant?.urlSlug
    ) {
      navigate(
        `/app/venue/${activeRestaurant.city}/${activeRestaurant.urlSlug}`
      );
    }
  }, [activeRestaurant, navigate, mode]); */

  return isLoading || isLoadingRestaurants ? (
    <LoaderSpinner />
  ) : (
    <div className={styles.listView}>
      {/* Map through list of restaurants and render ListItem component for
        each restaurant. Onclick set clicked restaurant as active restaurant */}
      {restaurants?.map((restaurant) => (
        <ListItem
          handleClick={() => setRestaurantParams(restaurant)}
          restaurant={restaurant}
          key={restaurant.id}
        />
      ))}
    </div>
  );
}

export default ListView;
