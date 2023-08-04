import { useRestaurants } from '../context/RestaurantContext';
import ListItem from './ListItem';
import VenueForm from './VenueForm';

function ListView() {
  const { restaurants, isLoading, errorMessage } = useRestaurants();

  return (
    <div>
      <VenueForm />
      {restaurants.map((restaurant) => (
        <ListItem restaurant={restaurant} key={restaurant.id} />
      ))}
    </div>
  );
}

export default ListView;
