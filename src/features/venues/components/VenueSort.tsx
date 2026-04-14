import { Select, SelectItem } from '@heroui/react';
import { FaSortAmountDownAlt, FaSortAmountUp } from 'react-icons/fa';
import { VenueSortField } from '@/types/venueTypes';
import { Direction } from '@/types/commonTypes';
import { VenueFilterContextType } from '@/context/VenueFilterContext';

interface VenueSortProps {
  useVenueContext: () => VenueFilterContextType;
}

function VenueSort({ useVenueContext }: VenueSortProps) {
  const { updateSort, resetSort } = useVenueContext();
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === 'default') {
      resetSort();
    } else {
      const [field, direction] = e.target.value.split('-');
      // Types asserted due to TypeScript interpreting event value as a string
      updateSort({
        field: field as VenueSortField,
        direction: direction as Direction,
      });
    }
  }
  return (
    <Select onChange={handleChange} label={'Sort by'} size="sm" radius="full">
      <SelectItem key={'default'}>Default</SelectItem>
      <SelectItem
        endContent={<FaSortAmountUp />}
        key={'averageHeatRating-desc'}
      >
        Hottest!
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountDownAlt />}
        key={'averageHeatRating-asc'}
      >
        Mildest
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountUp />}
        key={'averageQualityRating-desc'}
      >
        Highest Quality
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountDownAlt />}
        key={'averageQualityRating-asc'}
      >
        Lowest Quality
      </SelectItem>
      <SelectItem endContent={<FaSortAmountUp />} key={'totalReviews-desc'}>
        Most Reviews
      </SelectItem>
      <SelectItem endContent={<FaSortAmountDownAlt />} key={'totalReviews-asc'}>
        Least Reviews
      </SelectItem>
    </Select>
  );
}

export default VenueSort;
