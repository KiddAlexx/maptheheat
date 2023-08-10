import { useNavigate, useLocation } from 'react-router';
import { useRestaurants } from '../context/RestaurantContext';
import ListItem from './ListItem';
import { useEffect } from 'react';
import styles from './ListView.module.css';

function ListView() {
  const {
    restaurants,
    isLoading,
    errorMessage,
    setActiveRestaurant,
    activeRestaurant,
  } = useRestaurants();

  const navigate = useNavigate();

  const location = useLocation();
  const mode = location.pathname.includes('map') ? 'map' : 'venue';

  // Checks that activeRestaurant values exist before setting address with params
  useEffect(() => {
    if (mode === 'venue' && activeRestaurant.city && activeRestaurant.urlSlug) {
      navigate(
        `/app/venue/${activeRestaurant.city}/${activeRestaurant.urlSlug}`
      );
    }
  }, [activeRestaurant, navigate, mode]);

  return (
    <div className={styles.listView}>
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
