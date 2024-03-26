// React imports
import { Outlet } from 'react-router';

// Style imports
import styles from './RightPanel.module.css';

function RightPanel() {
  return (
    <main className={styles.rightPanelContainer}>
      <Outlet />
    </main>
  );
}

export default RightPanel;
