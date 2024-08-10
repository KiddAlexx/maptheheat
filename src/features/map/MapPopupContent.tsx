// React imports

// Style imports
import styles from './MapPopupContent.module.css';

// Type imports
import { Venue } from '../../types/venueTypes';
// Hooks imports
import { useParamsAndNavigate } from '../../hooks/useParamsAndNavigate';

// Component imports
import VenueRating from '../venues/components/VenueRating';

// File imports
import greyChilli from '../../assets/chilli-explosion-grey-md.jpg';
import mapPinIcon from '../../assets/icons/map-pin.svg';
import phoneIcon from '../../assets/icons/phone.svg';

interface MapPopupContentProps {
  venue: Venue;
}

function MapPopupContent({ venue }: MapPopupContentProps) {
  const setParamsAndNavigate = useParamsAndNavigate();

  const { venueName, venueId, averageRating, address, phoneNumber, images } =
    venue;

  return (
    <>
      {/* Duplication of code from ListItem - Move to own component */}
      {/* Render venue image if available, otherwise show default greyed out image */}
      {images?.length > 0 ? (
        <div className={styles.mainImageContainer}>
          <img
            className={styles.imageMainSmall}
            src={images[0].url}
            alt={images[0].alt}
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
