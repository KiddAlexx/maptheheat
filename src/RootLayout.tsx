import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import PageNav from './ui/PageNav';
import LoaderSpinner from './ui/LoaderSpinner';
import HomeFooter from './components/HomeFooter';

function RootLayout() {
  const { pathname } = useLocation();
  const showFooter = !pathname.startsWith('/app');

  return (
    <div className="flex min-h-dvh flex-col">
      <header>
        <PageNav />
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<LoaderSpinner />}>
          <Outlet />
        </Suspense>
      </div>

      {showFooter && <HomeFooter />}
    </div>
  );
}

export default RootLayout;
