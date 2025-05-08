// React imports
import { Outlet } from 'react-router';

function RightPanel() {
  return (
    <main className="flex-1 overflow-y-scroll bg-orange-200">
      <Outlet />
    </main>
  );
}

export default RightPanel;
