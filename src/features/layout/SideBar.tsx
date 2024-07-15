// React imports

// Style imports
import styles from './SideBar.module.css';
import VenueListContainer from '../venues/components/VenueListContainer';

function SideBar() {
  return (
    <div className={styles.sideBar}>
      <VenueListContainer />
    </div>
  );
}

export default SideBar;
