import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';
import VenueRating from './VenueRating';
import styles from './MapPopupContent.module.css';
import greyChilli from '../assets/chilli-explosion-grey-md.jpg';
import { Restaurant } from '../models/restaurantTypes';

interface MapPopupContentProps {
  restaurant: Restaurant;
}

function MapPopupContent({ restaurant }: MapPopupContentProps) {
  const { setActiveRestaurant } = useRestaurants();
  const { city, urlSlug, name, averageRating, address, phoneNumber, images } =
    restaurant;
  return (
    <>
      {/* Duplication of code from ListItem - Move to own component */}
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
      <div className={styles.popUpContentContainer}>
        <Link to={`/app/venue/${city}/${urlSlug}`}>
          <h2
            className={styles.venueNamePopup}
            onClick={() => {
              setActiveRestaurant(restaurant);
            }}
          >
            {name}
          </h2>
        </Link>
        <VenueRating initialRating={averageRating || null} readonly />
        <p>{address}</p>
        <p>{phoneNumber}</p>
      </div>
    </>
  );
}

export default MapPopupContent;
