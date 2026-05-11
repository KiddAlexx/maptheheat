import { VenueFilterContextType } from '@/context/VenueFilterContext';
import { Button, ButtonGroup } from '@heroui/react';
import { useState } from 'react';

interface VenueTypeFilterProps {
  useVenueContext: () => VenueFilterContextType;
}

type FilterValue = 'all' | 'restaurant' | 'shop';

function VenueTypeFilter({ useVenueContext }: VenueTypeFilterProps) {
  const [activeType, setActiveType] = useState('all');
  const { updateVenueFilter, removeVenueFilter } = useVenueContext();

  function handleFilterClick(filterValue: FilterValue) {
    setActiveType(filterValue);
    if (filterValue === 'all') {
      removeVenueFilter('venueType');
    } else {
      updateVenueFilter({
        field: 'venueType',
        value: filterValue,
        method: 'eq',
      });
    }
  }
  return (
    <ButtonGroup radius="full" size="md" fullWidth>
      <Button
        color={activeType === 'all' ? 'primary' : 'default'}
        variant={activeType === 'all' ? 'solid' : 'flat'}
        aria-pressed={activeType === 'all'}
        onPress={() => handleFilterClick('all')}
      >
        All
      </Button>
      <Button
        color={activeType === 'restaurant' ? 'primary' : 'default'}
        variant={activeType === 'restaurant' ? 'solid' : 'flat'}
        aria-pressed={activeType === 'restaurant'}
        onPress={() => handleFilterClick('restaurant')}
      >
        Restaurants
      </Button>
      <Button
        color={activeType === 'shop' ? 'primary' : 'default'}
        variant={activeType === 'shop' ? 'solid' : 'flat'}
        aria-pressed={activeType === 'shop'}
        onPress={() => handleFilterClick('shop')}
      >
        Shops
      </Button>
    </ButtonGroup>
  );
}

export default VenueTypeFilter;
