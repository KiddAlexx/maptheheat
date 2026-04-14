import { Button, ButtonGroup, Input } from '@heroui/react';
import { useState } from 'react';
import { VenueFilterContextType } from '@/context/VenueFilterContext';

interface VenueSearchBarProps {
  useVenueContext: () => VenueFilterContextType;
}

function VenueSearchBar({ useVenueContext }: VenueSearchBarProps) {
  const { updateVenueFilter, removeVenueFilter } = useVenueContext();
  const [searchValue, setSearchValue] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <form className="mb-3 flex gap-2" onSubmit={handleSubmit}>
      <Input
        radius="full"
        value={searchValue}
        onValueChange={setSearchValue}
        placeholder="Search by venue name"
      />
      <ButtonGroup radius="full">
        <Button variant="flat" type="button" onPress={clearSearch}>
          Clear
        </Button>
        <Button color="primary" type="submit">
          Search
        </Button>
      </ButtonGroup>
    </form>
  );
}

export default VenueSearchBar;
