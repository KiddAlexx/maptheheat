// Component imports
import ErrorModal from '../ui/ErrorModal';
import RightPanel from '../features/layout/RightPanel';
import SideBar from '../features/layout/SideBar';

// Style imports
import styles from './AppLayout.module.css';

function AppLayout() {
  return (
    <main className={styles.appContainer}>
      <SideBar />
      <RightPanel />
      {/* Will only display if error message exists in context */}
      <ErrorModal />
    </main>
  );
}

export default AppLayout;
