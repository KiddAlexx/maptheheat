// React imports

// Component imports
import ListView from '../venues/components/ListView';
import SearchBar from '../venues/components/SearchBar';

// Style imports
import styles from './SideBar.module.css';

function SideBar() {
  return (
    <div className={styles.sideBar}>
      <SearchBar />

      <ListView />
    </div>
  );
}

export default SideBar;
