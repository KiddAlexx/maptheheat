import { Outlet } from 'react-router-dom';
import PageNav from './ui/PageNav';

function RootLayout() {
  return (
    <div className="flex h-dvh flex-col">
      <header>
        <PageNav />
      </header>

      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout;
