// React imports

// Style imports
import styles from '../styles/ListItem.module.css';

// Hooks imports
import { useParamsAndNavigate } from '../../../hooks/useParamsAndNavigate';

// File imports
import greyChilli from '../../../assets/chilli-explosion-grey-md.jpg';
import clockIcon from '../../../assets/icons/clock.svg';
import mapPinIcon from '../../../assets/icons/map-pin.svg';
import phoneIcon from '../../../assets/icons/phone.svg';

// Component imports
import VenueRating from './VenueRating';

// Type imports
import { Venue } from '../../../models/venueTypes';
import { useGetReviews } from '@/features/reviews/hooks/useGetReviews';
import LoaderSpinner from '@/ui/LoaderSpinner';

interface ListItemProps {
  venue: Venue;
  handleClick: () => void;
}

function ListItem({ venue, handleClick }: ListItemProps) {
  const setParamsAndNavigate = useParamsAndNavigate();

  const { venueName, venueId, address, phoneNumber, images, averageRating } =
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
  /*  console.log('final images', venueName, allImages); */

  const finalRating = Math.round(averageRating * 2) / 2 || 5;

  return (
    <div className={styles.listItemContainer} onClick={handleClick}>
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

      <div>
        <h2>{venueName}</h2>
        <VenueRating initialRating={finalRating} readonly />
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
        {/* Link to the detailed page of the venue. 
            On click, set clicked venue as active venue. */}
        <button
          className={styles.moreInfoLink}
          onClick={(e) => {
            // Stop the click event from propagating to the list item
            e.stopPropagation();
            setParamsAndNavigate(venue, 'venue');
          }}
        >
          <p>More information!</p>
        </button>
      </div>
    </div>
  );
}

export default ListItem;
