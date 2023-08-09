import { useNavigate, useLocation } from 'react-router';
import { useRestaurants } from '../context/RestaurantContext';
import ListItem from './ListItem';
import { useEffect } from 'react';

function ListView() {
  const {
    restaurants,
    isLoading,
    errorMessage,
    setActiveRestaurant,
    activeRestaurant,
  } = useRestaurants();
  console.log('Active Restaurant in ListView render:', activeRestaurant);

  const navigate = useNavigate();

  const location = useLocation();
  const mode = location.pathname.includes('map') ? 'map' : 'venue';

  useEffect(() => {
    if (mode === 'venue') {
      navigate(
        `/app/venue/${activeRestaurant.city}/${activeRestaurant.urlSlug}`
      );
    }
  }, [activeRestaurant, navigate, mode]);

  return (
    <div>
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
