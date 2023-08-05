import { Outlet } from 'react-router';
import styles from './RightPanel.module.css';

function RightPanel() {
  return (
    <div className={styles.rightPanelContainer}>
      <Outlet />
    </div>
  );
}

export default RightPanel;
