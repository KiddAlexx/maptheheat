// React imports
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';

// Style imports
import styles from '../styles/DetailedVenueView.module.css';

// Hooks imports
import { useVenue } from '../hooks/useVenue';

// Component imports

import VenueRating from './VenueRating';
import LoaderSpinner from '../../../ui/LoaderSpinner';

// Type imports
import { Image } from '../../../models/venueTypes';

// File imports
import greyChilli from '../../../assets/chilli-explosion-grey-md.jpg';
import clockIcon from '../../../assets/icons/clock.svg';
import globeIcon from '../../../assets/icons/globe.svg';
import mapPinIcon from '../../../assets/icons/map-pin.svg';
import phoneIcon from '../../../assets/icons/phone.svg';
import infoIcon from '../../../assets/icons/info.svg';
import ReviewContainer from '../../reviews/components/ReviewContainer';
import { useCanUserReview } from '../../reviews/hooks/useCanUserReview';
import { useUser } from '../../authentication/useUser';
import { useModalContext } from '../../../context/ModalContext';

import { Button } from '@nextui-org/button';

function DetailedVenueView() {
  const { venueId } = useParams();
  console.log(venueId);
  const navigate = useNavigate();

  const { isLoading, isAuthenticated, fetchStatus, user } = useUser();
  const { openModal, openModalImages, openModalUpload } = useModalContext();
  const userId = user?.id;

  const { isLoading: isLoadingVenue, venue } = useVenue(venueId);
  const {
    isLoading: isLoadingReviewAuth,
    error,
    refetch: refetchUserPermission,
  } = useCanUserReview(userId, venueId, 30, false);

  if (isLoadingVenue) {
    return <LoaderSpinner />;
  }

  if (!venueId) {
    return;
  }

  const {
    venueName,
    city,
    venueNameSlug,
    phoneNumber,
    detailedAddress,
    website,
    description,
    averageRating,
    images,
  } = venue;

  const finalRating = Math.round(averageRating * 2) / 2 || 5;

  async function handleReview() {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    const { data: canUserReview } = await refetchUserPermission();
    console.log('here is permission', canUserReview);
    if (canUserReview) {
      navigate(`/app/venue/${city}/${venueNameSlug}/reviews/new/${venueId}`);
    } else alert('You cannot review the same venue within 30 days');
  }

  function handleAddImages() {
    if (!isAuthenticated) {
      openModal('login');
      return;
    } else {
      openModalUpload({
        modal: 'image-uploader',
        venueId,
        city,
        venueNameSlug,
      });
    }
  }

  return (
    <div className={styles.detailedViewContainer}>
      <h2>{venueName}</h2>
      <div className={styles.ratingUploadContainer}>
        <VenueRating initialRating={finalRating} readonly />
      </div>
      <div
        className={styles.multipleImageContainer}
        onClick={() => openModalImages('image-carousel', images)}
      >
        {images ? (
          // Slice first 4 images and map over
          // To be replaced with more refined component
          images.slice(0, 4).map((image: Image) => (
            <div className={styles.mainImageContainer}>
              <img
                className={styles.imageMainSmall}
                src={image.url}
                alt={image.alt}
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

      <Button onClick={handleAddImages}>Add Images</Button>
      {/*    <VenueImageCarousel venueImages={images} /> */}

      <button className="btn-default" onClick={handleReview}>
        Leave a review
      </button>

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
        <a href={website} target="_blank" rel="noopener noreferrer">
          {website}
        </a>
      </div>
      {/* Button to navigate back to map view. */}
      <Link to="/app/map" className={`btn-default ${styles.btnBackToMap}`}>
        Back to Map
      </Link>
      <ReviewContainer />
    </div>
  );
}

export default DetailedVenueView;
