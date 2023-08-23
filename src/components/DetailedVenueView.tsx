/* import { useParams } from 'react-router'; */
import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';
import ImageUpload from './ImageUploader';
import VenueRating from './VenueRating';
import greyChilli from '../assets/chilli-explosion-grey-md.jpg';

import styles from './DetailedVenueView.module.css';

import clockIcon from '../assets/icons/clock.svg';
import globeIcon from '../assets/icons/globe.svg';
import mapPinIcon from '../assets/icons/map-pin.svg';
import phoneIcon from '../assets/icons/phone.svg';
import infoIcon from '../assets/icons/info.svg';

function DetailedVenueView() {
  // Will be used to load venue from params
  /* const { city, venue } = useParams(); */

  const { activeRestaurant } = useRestaurants();

  if (!activeRestaurant) {
    return;
  }

  const {
    name,
    phoneNumber,
    detailedAddress,
    website,
    description,
    averageRating,
    images,
  } = activeRestaurant;

  return (
    <div className={styles.detailedViewContainer}>
      <h2>{name}</h2>
      <div className={styles.multipleImageContainer}>
        {images ? (
          // Slice first 5 images and map over
          // To be replaced with more refined component
          images.slice(0, 4).map((image) => (
            <div className={styles.mainImageContainer}>
              <img
                className={styles.imageMainSmall}
                src={image}
                alt="an image of restaurant"
              />
            </div>
          ))
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
      </div>
      <div className={styles.ratingUploadContainer}>
        <VenueRating initialRating={averageRating || null} readonly />
        <ImageUpload />
      </div>
      <div className={styles.iconTextContainer}>
        <img src={clockIcon} alt="icon of a clock" />
        <p>Open</p>
      </div>
      {/* Calculate based on opening hours */}
      <div className={styles.iconTextContainer}>
        <img src={mapPinIcon} alt="icon of a map pin" />
        <p>{detailedAddress}</p>
      </div>
      <div className={`${styles.iconTextContainer} ${styles.topAlignIcon}`}>
        <img src={infoIcon} alt="icon of an information symbol" />
        <p>{description}</p>
      </div>
      <div className={styles.iconTextContainer}>
        <img src={phoneIcon} alt="icon of a phone" />
        <p>{phoneNumber}</p>
      </div>
      <div className={styles.iconTextContainer}>
        <img src={globeIcon} alt="icon of a globe" />
        <a href={website}>{website}</a>
      </div>
      <Link to="/app/map" className={`btn-default ${styles.btnBackToMap}`}>
        Back to Map
      </Link>
    </div>
  );
}

export default DetailedVenueView;
