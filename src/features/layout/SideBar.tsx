// React imports
import { useState } from 'react';

// Component imports
import ListView from '../venues/shared/ListView';
import SearchBar from '../venues/shared/SearchBar';
import VenueForm from '../venues/shared/VenueForm';

// Style imports
import styles from './SideBar.module.css';
import ProtectedRoute from '../../ui/ProtectedRoute';

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
        <ProtectedRoute>
          <VenueForm setIsAddingVenue={setIsAddingVenue} />
        </ProtectedRoute>
      ) : (
        <ListView />
      )}
    </div>
  );
}

export default SideBar;
