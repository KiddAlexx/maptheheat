import { useVenueFilterContext } from '@/context/VenueFilterContext';
import { Button, ButtonGroup } from '@nextui-org/react';
import { useState } from 'react';

function VenueTypeFilter() {
  const [activeType, setActiveType] = useState('all');
  const { updateVenueFilter, removeVenueFilter, filters } =
    useVenueFilterContext();

  function handleFilterClick(type) {
    setActiveType(type);
    if (type === 'all') {
      removeVenueFilter('venueType');
    } else {
      updateVenueFilter({ field: 'venueType', value: type, method: 'eq' });
    }
    console.log(filters);
  }
  return (
    <ButtonGroup radius="sm">
      <Button
        color={activeType === 'all' ? 'primary' : 'default'}
        isDisabled={activeType === 'all'}
        onPress={() => handleFilterClick('all')}
      >
        All
      </Button>
      <Button
        color={activeType === 'restaurant' ? 'primary' : 'default'}
        isDisabled={activeType === 'restaurant'}
        onPress={() => handleFilterClick('restaurant')}
      >
        Restaurants
      </Button>
      <Button
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
