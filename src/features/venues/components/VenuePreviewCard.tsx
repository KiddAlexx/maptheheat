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
      className="mb-2 flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm  transition hover:shadow-md"
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
        <p className=" mb-1 text-sm font-semibold text-slate-900">
          {venueName}
        </p>
        <div className="mb-1 flex gap-1 [&>span]:!flex">
          <VenueRating initialRating={finalHeatRating} readonly size="16" />

          <span className="tracking-medium text-xs text-slate-600">
            ({totalReviewCount} {totalReviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        <p className=" text-xs text-slate-500">{city}</p>
      </div>

      <span className="hidden text-xs font-semibold text-primary-600 opacity-70 transition group-hover:opacity-100 xs:block">
        View →
      </span>
    </button>
  );
}

export default VenuePreviewCard;
