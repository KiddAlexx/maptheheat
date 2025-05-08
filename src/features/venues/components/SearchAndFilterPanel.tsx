// React imports

// Type imports

// Style imports

import { useLocation } from 'react-router-dom';
import VenueTypeFilter from './VenueTypeFilter';
import CitySelect from './CitySelect';
import VenueSort from './VenueSort';
import VenueSearchBar from './VenueSearchBar';
import { VenueFilterContextType } from '@/context/VenueFilterContext';

interface SearchAndFilerPanelProps {
  useVenueContext: () => VenueFilterContextType;
  favouriteVenues?: string[];
}

function SearchAndFilterPanel({
  useVenueContext,
  favouriteVenues,
}: SearchAndFilerPanelProps) {
  const location = useLocation();
  const isUserMode = location.pathname === '/profile/venues';

  return (
    <div className="rounded-md bg-zinc-400 p-3">
      {!isUserMode && <VenueSearchBar useVenueContext={useVenueContext} />}
      <CitySelect
        useVenueContext={useVenueContext}
        favouriteVenues={favouriteVenues}
      />
      <div className="flex gap-3">
        <VenueTypeFilter useVenueContext={useVenueContext} />
        <VenueSort useVenueContext={useVenueContext} />
      </div>
    </div>
  );
}

export default SearchAndFilterPanel;
