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
import { Venue } from '../../../types/venueTypes';

import LikeButton from '@/ui/LikeButton';
import { useUpdateFavouriteVenue } from '@/features/userProfile/hooks/useUpdateFavouriteVenue';
import toast from 'react-hot-toast';
import { useModalContext } from '@/context/ModalContext';
import { useLocation } from 'react-router';

interface ListItemProps {
  venue: Venue;
  handleClick: () => void;
  userId: string | null;
  isAuthenticated: boolean;
  favVenuesList?: string[] | null;
}

function ListItem({
  venue,
  handleClick,
  userId,
  isAuthenticated,
  favVenuesList,
}: ListItemProps) {
  const setParamsAndNavigate = useParamsAndNavigate();

  const location = useLocation();
  const isUserMode = location.pathname === '/profile/venues';

  const { openDialog } = useModalContext();

  const { venueName, venueId, address, phoneNumber, images, averageRating } =
    venue;

  const isFavourite = favVenuesList?.includes(venueId);

  const { updateFavouriteVenue } = useUpdateFavouriteVenue();

  function toggleFavourite(isFavouriteState: boolean) {
    if (!isAuthenticated || !userId) return;
    if (isUserMode) {
      openDialog(
        'Are you sure you want to remove this venue from your favourites?',
        () => {
          updateFavouriteVenue(
            { userId, venueId },
            {
              onSuccess: () => {
                isFavouriteState
                  ? toast.success(`${venueName} added to favourites!`)
                  : toast.success(`${venueName} removed from favourites!`);
              },
            }
          );
        }
      );
    } else {
      updateFavouriteVenue(
        { userId, venueId },
        {
          onSuccess: () => {
            isFavouriteState
              ? toast.success(`${venueName} added to favourites!`)
              : toast.success(`${venueName} removed from favourites!`);
          },
        }
      );
    }
  }

  const finalRating =
    averageRating != null ? Math.round(averageRating * 2) / 2 : 5;

  const mainImage = images?.[0];

  return (
    <div className={styles.listItemContainer} onClick={handleClick}>
      {mainImage ? (
        <div className={styles.mainImageContainer}>
          <img
            className={styles.imageMainSmall}
            src={mainImage.url}
            alt={mainImage.alt}
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
        <LikeButton
          isFavourite={isFavourite}
          isAuthenticated={isAuthenticated}
          handleClick={toggleFavourite}
        />
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
