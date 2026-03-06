// Third Party Imports
import clsx from 'clsx';

// Hooks
import {
  Outlet,
  useMatch,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

// Assets
import { Icon } from '@iconify/react/dist/iconify.js';

// Components
import VenueListContainer from '@/features/venues/components/VenueListContainer';
import { Button } from '@heroui/react';

type Pane = 'venue' | 'map' | 'list';

function AppLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const venueMatch = useMatch('/app/venue/:city/:country/:venue/:venueId');

  // Assign visible pane for mobile view based on url
  const currentPane =
    searchParams.get('pane') ?? (venueMatch ? 'venue' : 'list');

  // Helper function to to set current pane for mobile screen
  function setPane(pane: Pane) {
    const params = new URLSearchParams(searchParams);
    params.set('pane', pane);
    setSearchParams(params);
  }

  // Toggle pane on mobile screens
  function updatePane() {
    if (currentPane === 'list' && venueMatch) {
      const { city, country, venue, venueId } = venueMatch.params;
      const params = new URLSearchParams(searchParams);
      params.set('pane', 'map');
      navigate(
        `/app/map/${city}/${country}/${venue}/${venueId}?${params.toString()}`
      );
      return;
    }
    if (currentPane === 'list') {
      setPane('map');
      return;
    }
    if (currentPane === 'map') {
      setPane('list');
      return;
    }

    if (currentPane === 'venue') {
      setPane('list');
      return;
    }
  }

  return (
    <main className="relative flex h-full">
      <aside
        className={clsx(
          'w-full shrink flex-col p-3 lg:flex lg:min-w-[32rem] lg:basis-1/3',
          currentPane === 'list' ? 'flex' : 'hidden'
        )}
      >
        <VenueListContainer mode="venue" />
      </aside>
      <section
        className={clsx(
          'flex-1 overflow-y-scroll bg-zinc-50 lg:block',
          currentPane === 'map' || currentPane === 'venue' ? 'block' : 'hidden'
        )}
      >
        <Outlet />
      </section>

      <Button
        onPress={updatePane}
        size="md"
        className="absolute bottom-14 right-1/2 z-[1000] translate-x-1/2 gap-2 bg-success-300 lg:hidden"
      >
        {currentPane === 'list' ? (
          <>
            <Icon aria-hidden="true" icon="lucide:map-pin" width={16} />
            <span>Map</span>
          </>
        ) : (
          <>
            <Icon aria-hidden="true" icon="mi:list" width={20} />
            <span>List</span>
          </>
        )}
      </Button>
    </main>
  );
}

export default AppLayout;