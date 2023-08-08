import { useRestaurants } from '../context/RestaurantContext';
import ListItem from './ListItem';

function ListView() {
  const {
    restaurants,
    isLoading,
    errorMessage,
    setActiveRestaurant,
    activeRestaurant,
  } = useRestaurants();
  console.log('Active Restaurant in ListView render:', activeRestaurant);
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
