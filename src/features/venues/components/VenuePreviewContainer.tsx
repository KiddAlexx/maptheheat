import { useVenues } from '../hooks/useVenues';

import LoaderSpinner from '@/ui/LoaderSpinner';
import VenuePreviewCard from './VenuePreviewCard';
import { Icon } from '@iconify/react/dist/iconify.js';

function VenuePreviewContainer() {
  const { venues: latestVenues, isPending } = useVenues({
    filters: [],
    sort: { field: 'createdAt', direction: 'desc' },
    pagination: { pageNumber: 1, maxResults: 5 },
  });

  return (
    <div className="  w-full rounded-2xl border border-primary-100/80 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(122,37,21,0.45)] backdrop-blur-sm ">
      <div className="mb-4 flex items-center gap-2">
        <Icon icon="tdesign:chili" width={18} className="text-primary-500" />
        <p className="text-base font-semibold text-slate-800">
          Latest additions!
        </p>
      </div>
      {isPending ? (
        <LoaderSpinner message="loading latest venues" />
      ) : (
        latestVenues?.map((venue) => (
          <VenuePreviewCard venue={venue} key={venue.venueId} />
        ))
      )}
    </div>
  );
}

export default VenuePreviewContainer;
