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
    <div className="mb-5 rounded-xl border border-app-border bg-app-card p-4 shadow-md">
      {!isUserMode && <VenueSearchBar useVenueContext={useVenueContext} />}
      <CitySelect
        useVenueContext={useVenueContext}
        favouriteVenues={favouriteVenues}
      />
      <div className="flex flex-col-reverse gap-3 xs:flex-row">
        <VenueTypeFilter useVenueContext={useVenueContext} />
        <VenueSort useVenueContext={useVenueContext} />
      </div>
    </div>
  );
}

export default SearchAndFilterPanel;
