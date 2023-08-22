import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';
import ImageUpload from './ImageUploader';
import VenueRating from './VenueRating';
import greyChilli from '../assets/chilli-explosion-grey-md.jpg';

import styles from './DetailedVenueView.module.css';

function DetailedVenueView() {
  const { city, venue } = useParams();

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
          images.slice(0, 5).map((image) => (
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
      <VenueRating initialRating={averageRating || null} readonly />
      <p>{detailedAddress}</p>
      <p>{description}</p>
      <p>Open</p> {/* Calculate based on opening hours */}
      <p>{phoneNumber}</p>
      <a href={website}>{website}</a>
      <Link to="/app/map" className="btn-default">
        Back to Map
      </Link>
      <ImageUpload />
    </div>
  );
}

export default DetailedVenueView;
