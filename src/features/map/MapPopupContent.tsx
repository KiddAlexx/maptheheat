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
import { Image } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';

interface MapPopupContentProps {
  venue: Venue;
}

function MapPopupContent({ venue }: MapPopupContentProps) {
  const setParamsAndNavigate = useParamsAndNavigate();

  const {
    venueName,
    averageRating,
    address,
    phoneNumber,
    images,
    totalReviews,
  } = venue;

  const totalReviewCount = totalReviews ?? 0;

  const mainImage = images?.[0];
  const finalRating =
    averageRating != null ? Math.round(averageRating * 2) / 2 : 5;

  return (
    <div className={styles.global}>
      {/* Duplication of code from ListItem - Move to own component */}
      {/* Render venue image if available, otherwise show default greyed out image */}
      <div className="h-40 w-full overflow-hidden">
        <Image
          className="h-full w-full object-cover"
          src={mainImage?.url || greyChilli}
          alt={mainImage?.alt || 'a greyed out image of a chilli pepper'}
          radius="sm"
        />
      </div>
      {/* Link to the detailed page of the venue.  */}
      <div className="px-2">
        <h3>
          <button
            onClick={() => {
              setParamsAndNavigate(venue, 'venue');
            }}
            className="my-1 text-xl font-medium"
          >
            {venueName}
          </button>
        </h3>

        <div className="flex items-center gap-1">
          <VenueRating initialRating={finalRating} readonly size="20" />
          <span className="pb-1 text-sm">
            ({totalReviewCount} {totalReviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <Icon icon="lucide:map-pin" width={16} />
          <span>{address}</span>
        </div>
        <div className="mb-4 mt-2 flex items-center gap-2 text-sm">
          <Icon icon="lucide:phone" width={16} />
          <span>{phoneNumber}</span>
        </div>
      </div>
    </div>
  );
}

export default MapPopupContent;
