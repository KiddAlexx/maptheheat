import ListView from '../components/ListView';
import SearchBar from '../components/SearchBar';
import VenueForm from '../components/VenueForm';

function SideBar() {
  return (
    <div>
      <SearchBar />
      <VenueForm />
      <ListView />
    </div>
  );
}

export default SideBar;
