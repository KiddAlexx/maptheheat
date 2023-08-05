import RightPanel from '../components/RightPanel';
import SideBar from '../components/SideBar';
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
