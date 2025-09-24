// React imports

// Type imports

// Style imports

import { useMatch } from 'react-router-dom';
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
  const isUserMode = useMatch('/profile/venues');

  return (
    <div className="rounded-xl bg-zinc-400 p-3">
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
