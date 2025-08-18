// Component imports

import RightPanel from '../features/layout/RightPanel';
import SideBar from '../features/layout/SideBar';

function AppLayout() {
  return (
    <main className="flex h-[calc(100vh-5rem)]">
      <SideBar />
      <RightPanel />
    </main>
  );
}

export default AppLayout;
