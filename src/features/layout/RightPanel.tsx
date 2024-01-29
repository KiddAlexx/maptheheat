// React imports
import { Outlet } from 'react-router';

// Style imports
import styles from './RightPanel.module.css';

function RightPanel() {
  return (
    <div className={styles.rightPanelContainer}>
      <Outlet />
    </div>
  );
}

export default RightPanel;
