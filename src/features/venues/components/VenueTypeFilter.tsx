import { useVenueFilterContext } from '@/context/VenueFilterContext';
import { Button, ButtonGroup } from '@nextui-org/react';
import { useState } from 'react';

function VenueTypeFilter() {
  const [activeType, setActiveType] = useState('All');
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
    <ButtonGroup>
      <Button onPress={() => handleFilterClick('all')}>All</Button>
      <Button onPress={() => handleFilterClick('restaurant')}>
        Restaurants
      </Button>
      <Button onPress={() => handleFilterClick('shop')}>Shops</Button>
    </ButtonGroup>
  );
}

export default VenueTypeFilter;
