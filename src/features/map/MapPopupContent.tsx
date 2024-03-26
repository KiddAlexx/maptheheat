// React imports

// Style imports
import styles from './MapPopupContent.module.css';

// Type imports
import { Venue } from '../../models/venueTypes';
// Hooks imports
import { useParamsAndNavigate } from '../../hooks/useParamsAndNavigate';

// Component imports
import VenueRating from '../venues/components/VenueRating';

// File imports
import greyChilli from '../../assets/chilli-explosion-grey-md.jpg';
import mapPinIcon from '../../assets/icons/map-pin.svg';
import phoneIcon from '../../assets/icons/phone.svg';
import { useGetReviews } from '../reviews/hooks/useGetReviews';
import LoaderSpinner from '@/ui/LoaderSpinner';

interface MapPopupContentProps {
  venue: Venue;
}

function MapPopupContent({ venue }: MapPopupContentProps) {
  const setParamsAndNavigate = useParamsAndNavigate();

  const { venueName, venueId, averageRating, address, phoneNumber, images } =
    venue;

  const {
    isLoading: isLoadingReviews,
    error: reviewError,
    reviews,
  } = useGetReviews(venueId);

  if (isLoadingReviews) {
    return <LoaderSpinner />;
  }

  const reviewImages = reviews?.flatMap((review) => review.images || []);
  const allImages = [...(images || []), ...reviewImages];
  console.log('final images', venueName, allImages);
  return (
    <>
      {/* Duplication of code from ListItem - Move to own component */}
      {/* Render venue image if available, otherwise show default greyed out image */}
      {allImages.length > 0 ? (
        <div className={styles.mainImageContainer}>
          <img
            className={styles.imageMainSmall}
            src={allImages[0].url}
            alt={allImages[0].alt}
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
      {/* Link to the detailed page of the venue.  */}
      <div className={styles.popUpContentContainer}>
        <button
          className={styles.venueNamePopup}
          onClick={() => {
            setParamsAndNavigate(venue, 'venue');
          }}
        >
          {venueName}
        </button>

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
