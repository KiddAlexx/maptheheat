import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import PageNav from './ui/PageNav';
import LoaderSpinner from './ui/LoaderSpinner';
import HomeFooter from './components/HomeFooter';
import BackgroundBlobs from './ui/BackgroundBlobs';

function RootLayout() {
  const { pathname } = useLocation();
  const isFullHeightRoute =
    pathname.startsWith('/app') || pathname.startsWith('/admin');
  const showFooter = !isFullHeightRoute;

  return (
    <div
      className={`flex flex-col ${isFullHeightRoute ? 'h-dvh overflow-hidden' : 'min-h-dvh'}`}
    >
      <header>
        <PageNav />
      </header>

      <div
        className={`relative flex min-h-0 flex-1 flex-col${isFullHeightRoute ? ' overflow-hidden' : ''}`}
      >
        {pathname !== '/' && <BackgroundBlobs className="dark:hidden" />}
        <Suspense fallback={<LoaderSpinner />}>
          <Outlet />
        </Suspense>
      </div>

      {showFooter && <HomeFooter />}
    </div>
  );
}

export default RootLayout;
