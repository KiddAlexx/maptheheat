// React imports
import { useNavigate, useLocation } from 'react-router';
import { useEffect } from 'react';

// Style imports
import styles from './ListView.module.css';

// Hooks imports
import { useRestaurants } from '../context/RestaurantContext';

// Component imports
import ListItem from './ListItem';
import LoaderSpinner from './LoaderSpinner';

function ListView() {
  const { restaurants, setActiveRestaurant, activeRestaurant, isLoading } =
    useRestaurants();

  const navigate = useNavigate();
  const location = useLocation();

  // Determine the mode based on the current URL path
  const mode = location.pathname.includes('map') ? 'map' : 'venue';

  // If mode is 'venue' and there's an active restaurant with city and urlSlug values,
  // navigate to the detailed page of the active restaurant.
  useEffect(() => {
    if (
      mode === 'venue' &&
      activeRestaurant?.city &&
      activeRestaurant?.urlSlug
    ) {
      navigate(
        `/app/venue/${activeRestaurant.city}/${activeRestaurant.urlSlug}`
      );
    }
  }, [activeRestaurant, navigate, mode]);

  return isLoading ? (
    <LoaderSpinner />
  ) : (
    <div className={styles.listView}>
      {/* Map through list of restaurants and render ListItem component for
        each restaurant. Onclick set clicked restaurant as active restaurant */}
      {restaurants.map((restaurant) => (
        <ListItem
          handleClick={() => {
            setActiveRestaurant(restaurant);
          }}
          restaurant={restaurant}
          key={restaurant.id}
        />
      ))}
    </div>
  );
}

export default ListView;
