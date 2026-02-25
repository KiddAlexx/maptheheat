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
    <div className=" w-full rounded-xl border border-gray-200 bg-white p-5 shadow-md">
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
