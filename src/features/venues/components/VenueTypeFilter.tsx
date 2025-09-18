import { VenueFilterContextType } from '@/context/VenueFilterContext';
import { Button, ButtonGroup } from '@heroui/react';
import { useState } from 'react';

interface VenueTypeFilterProps {
  useVenueContext: () => VenueFilterContextType;
}

type FilterValue = 'all' | 'restaurant' | 'shop';

function VenueTypeFilter({ useVenueContext }: VenueTypeFilterProps) {
  const [activeType, setActiveType] = useState('all');
  const { updateVenueFilter, removeVenueFilter, filters } = useVenueContext();

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
    <ButtonGroup radius="sm" className="">
      <Button
        className="h-12"
        color={activeType === 'all' ? 'primary' : 'default'}
        isDisabled={activeType === 'all'}
        onPress={() => handleFilterClick('all')}
      >
        All
      </Button>
      <Button
        className="h-12"
        color={activeType === 'restaurant' ? 'primary' : 'default'}
        isDisabled={activeType === 'restaurant'}
        onPress={() => handleFilterClick('restaurant')}
      >
        Restaurants
      </Button>
      <Button
        className="h-12"
        color={activeType === 'shop' ? 'primary' : 'default'}
        isDisabled={activeType === 'shop'}
        onPress={() => handleFilterClick('shop')}
      >
        Shops
      </Button>
    </ButtonGroup>
  );
}

export default VenueTypeFilter;
