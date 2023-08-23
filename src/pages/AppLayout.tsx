import ErrorModal from '../components/ErrorModal';
import RightPanel from '../components/RightPanel';
import SideBar from '../components/SideBar';
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
