// Component imports

import RightPanel from '../features/layout/RightPanel';
import SideBar from '../features/layout/SideBar';

// Style imports
import styles from './AppLayout.module.css';

function AppLayout() {
  return (
    <main className={styles.appContainer}>
      <SideBar />
      <RightPanel />
    </main>
  );
}

export default AppLayout;
