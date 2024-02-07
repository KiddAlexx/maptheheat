// Component imports
import ErrorModal from '../ui/ErrorModal';
import RightPanel from '../features/layout/RightPanel';
import SideBar from '../features/layout/SideBar';

// Style imports
import styles from './AppLayout.module.css';
import ModalManager from '../components/ModalManager';

function AppLayout() {
  return (
    <main className={styles.appContainer}>
      <SideBar />
      <RightPanel />
    </main>
  );
}

export default AppLayout;
