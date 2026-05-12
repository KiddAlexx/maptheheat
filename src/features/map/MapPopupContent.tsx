//Third Party Imports

// Hooks
import { useParamsAndNavigate } from '@/hooks/useParamsAndNavigate';

// Assets
import greyChilli from '@/assets/chilli-explosion-grey-md.jpg';
import { Icon } from '@iconify/react/dist/iconify.js';

// Components
import VenueRating from '../venues/components/VenueRating';
import { Image } from '@heroui/react';

// Type imports
import type { Venue } from '@/types/venueTypes';

// Style imports
import styles from './MapPopupContent.module.css';

interface MapPopupContentProps {
  venue: Venue;
}

function MapPopupContent({ venue }: MapPopupContentProps) {
  const setParamsAndNavigate = useParamsAndNavigate();

  const {
    venueName,
    averageHeatRating,
    averageQualityRating,
    address,
    phoneNumber,
    thumbnailImage,
  } = venue;

  /*   const totalReviewCount = totalReviews ?? 0; */

  // Create a unique id to be used on each main button
  // Used to assign accessible name
  const finalHeatRating =
    averageHeatRating != null ? Math.round(averageHeatRating * 2) / 2 : 0;

  const finalQualityRating =
    averageQualityRating != null
      ? Math.round(averageQualityRating * 10) / 10
      : 0;

  return (
    <button
      type="button"
      className={`${styles.global} w-full cursor-pointer text-left`}
      onClick={() => setParamsAndNavigate(venue, 'venue')}
      aria-label={`View details for ${venueName}`}
    >
      {/* Render venue image if available, otherwise show default greyed out image */}
      <div className="h-40 w-full overflow-hidden">
        <Image
          className="h-full w-full object-cover"
          src={thumbnailImage?.url || greyChilli}
          alt={thumbnailImage?.alt || 'a greyed out image of a chilli pepper'}
          radius="sm"
        />
      </div>
      <div className="px-2">
        <h3 className="my-1 text-xl font-medium text-foreground">
          {venueName}
        </h3>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <Icon className="text-yellow-600" icon="lucide:star" width={18} />
            <span className="text-small">({finalQualityRating})</span>
          </div>
          {/* display flex is forced to override default display inline block
                  of react rating - ensures icons allign correctly */}
          <div className="flex items-center gap-1 [&>span]:!flex">
            <VenueRating initialRating={finalHeatRating} readonly size="20" />
          </div>
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
    </button>
  );
}

export default MapPopupContent;
