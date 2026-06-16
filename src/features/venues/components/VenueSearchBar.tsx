import { Button, ButtonGroup, Input } from '@heroui/react';
import { useEffect, useState } from 'react';
import { VenueFilterContextType } from '@/context/VenueFilterContext';
import { getFilterValue } from '../utils/getFilterValue';

interface VenueSearchBarProps {
  useVenueContext: () => VenueFilterContextType;
}

function VenueSearchBar({ useVenueContext }: VenueSearchBarProps) {
  const { filters, updateVenueFilter, removeVenueFilter } = useVenueContext();

  // The applied term is stored wrapped as `%term%` for the ilike query; strip
  // the wrapping to recover what the user actually typed.
  const contextTerm = ((getFilterValue(filters, 'venueName') as string) ?? '').replace(
    /^%|%$/g,
    ''
  );

  // Local draft state for in-progress typing (only committed on submit),
  // seeded from context on mount so a remount shows the applied search term.
  const [searchValue, setSearchValue] = useState(contextTerm);

  // Resync the draft when the context term changes externally — e.g. selecting
  // a city clears the venueName filter (see CitySelect.handleSelectCity).
  useEffect(() => {
    setSearchValue(contextTerm);
  }, [contextTerm]);

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
        variant="bordered"
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
