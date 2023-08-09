import { useState } from 'react';
import ListView from '../components/ListView';
import SearchBar from '../components/SearchBar';
import VenueForm from '../components/VenueForm';
import styles from './SideBar.module.css';

function SideBar() {
  const [isAddingVenue, setIsAddingVenue: ] = useState(false);
  console.log(isAddingVenue);
  return (
    <div className={styles.sideBar}>
      <SearchBar setIsAddingVenue={setIsAddingVenue} />
      {isAddingVenue ? (
        <VenueForm setIsAddingVenue={setIsAddingVenue} />
      ) : (
        <ListView />
      )}
    </div>
  );
}

export default SideBar;
