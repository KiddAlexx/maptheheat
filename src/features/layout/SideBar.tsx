// React imports

// Component imports
import ListView from '../venues/components/ListView';
import SearchAndFilterPanel from '../venues/components/SearchAndFilterPanel';

// Style imports
import styles from './SideBar.module.css';

function SideBar() {
  return (
    <div className={styles.sideBar}>
      <SearchAndFilterPanel />
      <ListView />
    </div>
  );
}

export default SideBar;
