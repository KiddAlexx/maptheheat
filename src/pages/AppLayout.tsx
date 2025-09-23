// Component imports

import VenueListContainer from '@/features/venues/components/VenueListContainer';
import clsx from 'clsx';

import { Outlet } from 'react-router';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useUIContext } from '@/context/UIContext';

function AppLayout() {
  const { currentView, updateView } = useUIContext();

  function handleView() {
    if (currentView === 'list') updateView('map');
    if (currentView === 'map') updateView('list');
    if (currentView === 'venue') updateView('list');
  }

  return (
    <main className="relative flex h-full">
      <aside
        className={clsx(
          'w-full shrink flex-col p-3 lg:flex lg:min-w-[32rem] lg:basis-1/3',
          currentView === 'list' ? 'flex' : 'hidden'
        )}
      >
        <VenueListContainer mode="venue" />
      </aside>
      <section
        className={clsx(
          'flex-1 overflow-y-scroll bg-orange-50 lg:block',
          currentView === 'map' || currentView === 'venue' ? 'block' : 'hidden'
        )}
      >
        <Outlet />
      </section>
      <Button
        onPress={handleView}
        size="lg"
        className="absolute bottom-3 right-1/2 z-[1000] translate-x-1/2 gap-2 lg:hidden"
      >
        {currentView === 'list' ? (
          <>
            <Icon icon="lucide:map-pin" width={16} />
            <span>Map</span>
          </>
        ) : (
          <>
            <Icon icon="mi:list" width={20} />
            <span>List</span>
          </>
        )}
      </Button>
    </main>
  );
}

export default AppLayout;
