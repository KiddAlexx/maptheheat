import { Button, Input } from '@heroui/react';
import { useState } from 'react';
import { VenueFilterContextType } from '@/context/VenueFilterContext';

interface VenueSearchBarProps {
  useVenueContext: () => VenueFilterContextType;
}

function VenueSearchBar({ useVenueContext }: VenueSearchBarProps) {
  const { updateVenueFilter, removeVenueFilter } = useVenueContext();
  const [searchValue, setSearchValue] = useState('');

  function handleSumbit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formattedSearchValue = `%${searchValue}%`;

    updateVenueFilter({
      field: 'venueName',
      value: formattedSearchValue,
      method: 'ilike',
    });
  }
  function clearSearch() {
    setSearchValue('');
    removeVenueFilter('venueName');
  }
  return (
    <form className="relative mb-3" onSubmit={handleSumbit}>
      <Input
        radius="sm"
        onValueChange={(value) => setSearchValue(value)}
        value={searchValue}
        placeholder="Search by venue name"
      />
      <div className="absolute bottom-0 right-0 z-20">
        <Button radius="none" onPress={clearSearch}>
          Clear
        </Button>
        <Button className="rounded-r-md" radius="none" type="submit">
          Search
        </Button>
      </div>
    </form>
  );
}

export default VenueSearchBar;
