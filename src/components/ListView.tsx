// React imports

// Style imports
import styles from './ListView.module.css';

// Hooks imports
import { useRestaurants as useRestaurantsContext } from '../context/RestaurantContext';
import { useRestaurants } from '../features/restaurants/useRestaurants';
import { useParamsAndNavigate } from '../hooks/useParamsAndNavigate';

// Component imports
import ListItem from './ListItem';
import LoaderSpinner from './LoaderSpinner';

function ListView() {
  const { isLoading } = useRestaurantsContext();

  // Load restaurants from supabase
  const {
    restaurants,
    error,
    isLoading: isLoadingRestaurants,
  } = useRestaurants();

  const setParamsAndNavigate = useParamsAndNavigate();

  return isLoading || isLoadingRestaurants ? (
    <LoaderSpinner />
  ) : (
    <div className={styles.listView}>
      {/* Map through list of restaurants and render ListItem component for
        each restaurant. Onclick set clicked restaurant as active restaurant */}
      {restaurants?.map((restaurant) => (
        <ListItem
          handleClick={() => setParamsAndNavigate(restaurant)}
          restaurant={restaurant}
          key={restaurant.id}
        />
      ))}
    </div>
  );
}

export default ListView;
