import { useVenueFilterContext } from '@/context/VenueFilterContext';
import SearchAndFilterPanel from './SearchAndFilterPanel';
import ListView from './VenueListView';
import VenuePagination from './VenuePagination';
import { useUserFavVenuesContext } from '@/context/UserFavVenuesContext';

interface VenueListContainerProps {
  mode: 'venue' | 'user';
}

function VenueListContainer({ mode }: VenueListContainerProps) {
  // Assigns which context to use for pagination and sorting
  // based on mode prop
  const useVenueContext =
    mode === 'venue' ? useVenueFilterContext : useUserFavVenuesContext;
  return (
    <>
      <SearchAndFilterPanel useVenueContext={useVenueContext} />
      <VenuePagination useVenueContext={useVenueContext} />
      <ListView useVenueContext={useVenueContext} />
      <VenuePagination useVenueContext={useVenueContext} />
    </>
  );
}

export default VenueListContainer;
