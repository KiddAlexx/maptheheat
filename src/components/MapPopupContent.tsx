// React imports
import { Link } from 'react-router-dom';

// Style imports
import styles from './MapPopupContent.module.css';

// Type imports
import { Restaurant } from '../models/restaurantTypes';

// Hooks imports
import { useRestaurants } from '../context/RestaurantContext';

// Component imports
import VenueRating from './VenueRating';

// File imports
import greyChilli from '../assets/chilli-explosion-grey-md.jpg';
import mapPinIcon from '../assets/icons/map-pin.svg';
import phoneIcon from '../assets/icons/phone.svg';

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
      {/* Render restaurant image if available, otherwise show default greyed out image */}
      {images ? (
        <div className={styles.mainImageContainer}>
          <img
            className={styles.imageMainSmall}
            src={images[0].url}
            alt={images[0].alt}
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
      {/* Link to the detailed page of the restaurant. 
          On click, set the active restaurant in the context. */}
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
        <VenueRating initialRating={averageRating || 5} readonly />
        <div className={styles.iconTextContainer}>
          <img src={mapPinIcon} alt="icon of a map pin" />
          <p>{address}</p>
        </div>
        <div className={styles.iconTextContainer}>
          <img src={phoneIcon} alt="icon of a phone" />
          <p>{phoneNumber}</p>
        </div>
      </div>
    </>
  );
}

export default MapPopupContent;
