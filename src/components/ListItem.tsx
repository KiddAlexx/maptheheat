import { Link } from 'react-router-dom';
import styles from './ListItem.module.css';
import { useRestaurants } from '../context/RestaurantContext';

function ListItem({ restaurant, handleClick }) {
  const { name, address, hours, phoneNumber, city, urlSlug } = restaurant;
  const { setActiveRestaurant } = useRestaurants();
  return (
    <div className={styles.listItemContainer} onClick={handleClick}>
      <div className={styles.tempImageContainer}></div>
      <div>
        <h2>{name}</h2>
        <h3>{address}</h3>
        <p>{hours}</p>
        <p>{phoneNumber}</p>
        <Link to={`/app/venue/${city}/${urlSlug}`}>
          <p
            onClick={() => {
              setActiveRestaurant(restaurant);
            }}
          >
            More information!
          </p>
        </Link>
      </div>
    </div>
  );
}

export default ListItem;
