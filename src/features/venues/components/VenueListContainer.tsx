import { useVenueFilterContext } from '@/context/VenueFilterContext';
import SearchAndFilterPanel from './SearchAndFilterPanel';
import ListView from './VenueListView';
import VenuePagination from './VenuePagination';
import { useUserFavVenuesContext } from '@/context/UserFavVenuesContext';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';

interface VenueListContainerProps {
  mode: 'venue' | 'user';
  favouriteVenues?: string[] | null;
}

function VenueListContainer({
  mode,
  favouriteVenues,
}: VenueListContainerProps) {
  // Assigns which context to use for pagination and sorting
  // based on mode prop
  const useVenueContext =
    mode === 'venue' ? useVenueFilterContext : useUserFavVenuesContext;

  return (
    <>
      <SearchAndFilterPanel
        useVenueContext={useVenueContext}
        favouriteVenues={
          mode === 'user' ? favouriteVenues ?? undefined : undefined
        }
      />
      {mode === 'venue' && (
        <div className=" my-2 flex items-center justify-between p-1">
          <p>Can't find what you are looking for?</p>
          <Button as={Link} to="/add-venue" radius="sm">
            Add new venue!
          </Button>
        </div>
      )}
      <VenuePagination
        useVenueContext={useVenueContext}
        favouriteVenues={
          mode === 'user' ? favouriteVenues ?? undefined : undefined
        }
      />

      <ListView
        useVenueContext={useVenueContext}
        favouriteVenues={
          mode === 'user' ? favouriteVenues ?? undefined : undefined
        }
      />

      <VenuePagination
        useVenueContext={useVenueContext}
        favouriteVenues={
          mode === 'user' ? favouriteVenues ?? undefined : undefined
        }
      />
    </>
  );
}

export default VenueListContainer;
