import ListView from '../components/ListView';
import SearchBar from '../components/SearchBar';
import VenueForm from '../components/VenueForm';

function AppLayout() {
  return (
    <main>
      <SearchBar />
      <VenueForm />
      <ListView />
    </main>
  );
}

export default AppLayout;
