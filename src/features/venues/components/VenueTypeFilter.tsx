import { VenueFilterContextType } from '@/context/VenueFilterContext';
import { Button, ButtonGroup } from '@heroui/react';
import { getFilterValue } from '../utils/getFilterValue';

interface VenueTypeFilterProps {
  useVenueContext: () => VenueFilterContextType;
}

type FilterValue = 'all' | 'restaurant' | 'shop';

function VenueTypeFilter({ useVenueContext }: VenueTypeFilterProps) {
  const { filters, updateVenueFilter, removeVenueFilter } = useVenueContext();

  // Derived from context so the active button reflects the applied filter
  // after the panel remounts on navigation.
  const activeType = (getFilterValue(filters, 'venueType') as FilterValue) ?? 'all';

  function handleFilterClick(filterValue: FilterValue) {
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
