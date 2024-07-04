// React imports

// Component imports
import ListView from '../venues/components/ListView';
import SearchAndFilterPanel from '../venues/components/SearchAndFilterPanel';
import VenuePagination from '../venues/components/VenuePagination';

// Style imports
import styles from './SideBar.module.css';

function SideBar() {
  return (
    <div className={styles.sideBar}>
      <SearchAndFilterPanel />
      <VenuePagination />
      <ListView />
      <VenuePagination />
    </div>
  );
}

export default SideBar;
