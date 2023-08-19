import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';

function MapPopupContent({ restaurant }) {
  const { setActiveRestaurant } = useRestaurants();
  return (
    <>
      {/*   <div className={styles.tempImageContainer}></div> */}
      <Link to={`/app/venue/${restaurant.city}/${restaurant.urlSlug}`}>
        <h2
          onClick={() => {
            setActiveRestaurant(restaurant);
          }}
        >
          {restaurant.name}
        </h2>
      </Link>
    </>
  );
}

export default MapPopupContent;
