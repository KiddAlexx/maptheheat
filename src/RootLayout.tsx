import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import PageNav from './ui/PageNav';
import LoaderSpinner from './ui/LoaderSpinner';

function RootLayout() {
  return (
    <div className="flex h-dvh flex-col">
      <header>
        <PageNav />
      </header>

      <div className="min-h-0 flex-1">
        <Suspense fallback={<LoaderSpinner />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

export default RootLayout;
