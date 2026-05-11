import { useUIContext } from '@/context/UIContext';
import { useParamsAndNavigate } from '@/hooks/useParamsAndNavigate';
import { Venue } from '@/types/venueTypes';
import { Image } from '@heroui/react';
import greyChilli from '@/assets/chilli-explosion-grey-md.jpg';
import VenueRating from './VenueRating';

interface VenuePreviewCardProps {
  venue: Venue;
}

function VenuePreviewCard({ venue }: VenuePreviewCardProps) {
  const setParamsAndNavigate = useParamsAndNavigate();
  const { isLargeScreen } = useUIContext();

  const { city, venueName, thumbnailImage, averageHeatRating, totalReviews } =
    venue;

  const finalHeatRating =
    averageHeatRating != null ? Math.round(averageHeatRating * 2) / 2 : 0;

  const totalReviewCount = totalReviews ?? 0;

  function handleSelectVenue(venue: Venue) {
    isLargeScreen
      ? setParamsAndNavigate(venue)
      : setParamsAndNavigate(venue, 'venue');
  }

  return (
    <button
      className="mb-2 flex w-full items-center gap-3 rounded-xl border border-app-border bg-app-card p-3 text-left shadow-sm transition-shadow hover:border-primary-200 hover:bg-primary-50/30 hover:shadow-md dark:hover:border-primary-400 dark:hover:bg-primary-900/20"
      onClick={() => handleSelectVenue(venue)}
    >
      <div className="relative h-12 w-12 ">
        <Image
          className="h-full w-full object-cover"
          src={thumbnailImage?.url || greyChilli}
          fallbackSrc={greyChilli}
          alt={thumbnailImage?.alt || 'a greyed out image of a chilli pepper'}
          removeWrapper
          radius="sm"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-semibold text-foreground">
          {venueName}
        </p>
        <div className="mb-1 flex gap-1 [&>span]:!flex">
          <VenueRating initialRating={finalHeatRating} readonly size="16" />

          <span className="tracking-medium text-xs text-app-muted">
            ({totalReviewCount} {totalReviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        <p className="text-xs text-app-muted">{city}</p>
      </div>

      <span className="hidden text-xs font-semibold text-primary-600 opacity-70 transition group-hover:opacity-100 xs:block">
        View →
      </span>
    </button>
  );
}

export default VenuePreviewCard;
