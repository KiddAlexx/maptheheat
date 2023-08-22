import { Link } from 'react-router-dom';
import styles from './ListItem.module.css';
import { useRestaurants } from '../context/RestaurantContext';
import greyChilli from '../assets/chilli-explosion-grey-md.jpg';
import VenueRating from './VenueRating';

import { Restaurant } from '../models/restaurantTypes';

interface ListItemProps {
  restaurant: Restaurant;
  handleClick: () => void;
}

function ListItem({ restaurant, handleClick }: ListItemProps) {
  const { name, address, phoneNumber, city, urlSlug, images, averageRating } =
    restaurant;
  const { setActiveRestaurant } = useRestaurants();
  console.log(restaurant);
  return (
    <div className={styles.listItemContainer} onClick={handleClick}>
      {images ? (
        <div className={styles.mainImageContainer}>
          <img
            className={styles.imageMainSmall}
            src={images[0]}
            alt="an image of restaurant"
          />
        </div>
      ) : (
        <div className={styles.mainImageContainer}>
          <img
            className={styles.imageMainSmall}
            src={greyChilli}
            alt="an greyed out image of a chilli pepper"
          />
          <p className={styles.addPhotosText}>Add Photos</p>
        </div>
      )}

      {/* Fix alt text*/}
      <div>
        <h2>{name}</h2>
        <VenueRating initialRating={averageRating || null} readonly />
        <p>{address}</p>
        <p>Open</p> {/* Temp , calculate open state based on hours */}
        <p>{phoneNumber}</p>
        <Link
          className={styles.moreInfoLink}
          to={`/app/venue/${city}/${urlSlug}`}
        >
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
