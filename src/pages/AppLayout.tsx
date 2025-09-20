// Component imports

import VenueListContainer from '@/features/venues/components/VenueListContainer';
import { useState } from 'react';
import clsx from 'clsx';

import { Outlet } from 'react-router';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';

function AppLayout() {
  const [view, setView] = useState('list');

  function handleView() {
    setView((v) => (v === 'list' ? 'map' : 'list'));
  }

  return (
    <main className="relative flex h-full">
      <aside
        className={clsx(
          'w-full shrink flex-col p-3 lg:flex lg:min-w-[32rem] lg:basis-1/3',
          view === 'list' ? 'flex' : 'hidden'
        )}
      >
        <VenueListContainer mode="venue" />
      </aside>
      <section
        className={clsx(
          'flex-1 overflow-y-scroll bg-orange-50 lg:block',
          view === 'map' ? 'block' : 'hidden'
        )}
      >
        <Outlet />
      </section>
      <Button
        onPress={handleView}
        size="lg"
        className="absolute bottom-3 right-1/2 z-[1000] translate-x-1/2 gap-2 lg:hidden"
      >
        {view === 'list' ? (
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
