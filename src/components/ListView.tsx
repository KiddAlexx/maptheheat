import { useNavigate, useLocation } from 'react-router';
import { useRestaurants } from '../context/RestaurantContext';
import ListItem from './ListItem';
import { useEffect } from 'react';
import styles from './ListView.module.css';
import LoaderSpinner from './LoaderSpinner';

function ListView() {
  const { restaurants, setActiveRestaurant, activeRestaurant, isLoading } =
    useRestaurants();

  const navigate = useNavigate();

  const location = useLocation();
  const mode = location.pathname.includes('map') ? 'map' : 'venue';

  // Checks that activeRestaurant values exist before setting address with params
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
