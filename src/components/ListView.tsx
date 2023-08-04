import { useRestaurants } from '../context/RestaurantContext';
import ListItem from './ListItem';

function ListView() {
  const { restaurants, isLoading, errorMessage } = useRestaurants();

  return (
    <div>
      {restaurants.map((restaurant) => (
        <ListItem restaurant={restaurant} key={restaurant.id} />
      ))}
    </div>
  );
}

export default ListView;
