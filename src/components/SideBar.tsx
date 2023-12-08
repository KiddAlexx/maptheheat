// React imports
import { useState } from 'react';

// Component imports
import ListView from '../components/ListView';
import SearchBar from '../components/SearchBar';
import VenueForm from '../components/VenueForm';

// Style imports
import styles from './SideBar.module.css';

export interface VenueFormProps {
  setIsAddingVenue: React.Dispatch<React.SetStateAction<boolean>>;
}

function SideBar() {
  // State used to conditionally render VenueForm when true and ListView when false
  // Value set in VenueForm and SearchBar
  const [isAddingVenue, setIsAddingVenue] = useState(false);

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
