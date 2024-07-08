import { Select, SelectItem } from '@nextui-org/react';
import { FaSortAmountDownAlt, FaSortAmountUp } from 'react-icons/fa';
import { useVenueFilterContext } from '@/context/VenueFilterContext';
import { VenueSortField, Direction } from '@/context/VenueFilterContext';

function VenueSort() {
  const { updateSort, resetSort } = useVenueFilterContext();
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
    <Select onChange={handleChange} label={'Sort by'}>
      <SelectItem value={'default'} key={'default'}>
        Default
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountUp />}
        value={'averageRating-desc'}
        key={'averageRating-desc'}
      >
        Heat Rating
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountDownAlt />}
        value={'averageRating-asc'}
        key={'averageRating-asc'}
      >
        Heat Rating
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountUp />}
        value={'totalReviews-desc'}
        key={'totalReviews-desc'}
      >
        Review Count
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountDownAlt />}
        value={'totalReviews-asc'}
        key={'totalReviews-asc'}
      >
        Review Count
      </SelectItem>
    </Select>
  );
}

export default VenueSort;
