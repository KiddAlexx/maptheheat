import { Link } from 'react-router-dom';
import styles from './ListItem.module.css';
import { useRestaurants } from '../context/RestaurantContext';
import greyChilli from '../assets/chilli-explosion-grey-md.jpg';
import VenueRating from './VenueRating';

import { Restaurant } from '../models/restaurantTypes';

import clockIcon from '../assets/icons/clock.svg';
import mapPinIcon from '../assets/icons/map-pin.svg';
import phoneIcon from '../assets/icons/phone.svg';

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
          {/* Fix alt text - user input / somehow generated... */}
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

      <div>
        <h2>{name}</h2>
        <VenueRating initialRating={averageRating || null} readonly />
        <div className={styles.iconTextContainer}>
          <img src={clockIcon} alt="icon of a clock" />
          <p>Open</p>
        </div>
        <div className={styles.iconTextContainer}>
          <img src={mapPinIcon} alt="icon of a map pin" />
          <p>{address}</p>
        </div>

        {/* Temp , calculate open state based on hours */}
        <div className={styles.iconTextContainer}>
          <img src={phoneIcon} alt="icon of a phone" />
          <p>{phoneNumber}</p>
        </div>
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
