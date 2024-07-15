import SearchAndFilterPanel from './SearchAndFilterPanel';
import ListView from './VenueListView';
import VenuePagination from './VenuePagination';

function VenueListContainer() {
  return (
    <>
      <SearchAndFilterPanel />
      <VenuePagination />
      <ListView />
      <VenuePagination />
    </>
  );
}

export default VenueListContainer;
