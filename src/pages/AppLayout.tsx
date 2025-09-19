// Component imports

import VenueListContainer from '@/features/venues/components/VenueListContainer';

import { Outlet } from 'react-router';

function AppLayout() {
  return (
    <main className="flex h-full">
      <aside className="flex w-[40rem] shrink-0 flex-col p-3">
        <VenueListContainer mode="venue" />
      </aside>
      <section className="flex-1 overflow-y-scroll bg-orange-50">
        <Outlet />
      </section>
    </main>
  );
}

export default AppLayout;
