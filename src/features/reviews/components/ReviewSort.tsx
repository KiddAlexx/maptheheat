import {
  ReviewSortField,
  useReviewSortContext,
} from '@/context/ReviewSortContext';
import { Direction } from '@/context/VenueFilterContext';
import { Select, SelectItem } from '@nextui-org/react';
import { FaSortAmountDownAlt, FaSortAmountUp } from 'react-icons/fa';

function ReviewSort() {
  const { updateSort, resetSort } = useReviewSortContext();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === 'default') {
      resetSort();
    } else {
      const [field, direction] = e.target.value.split('-');
      // Types asserted due to TypeScript interpreting event value as a string
      updateSort({
        field: field as ReviewSortField,
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
        value={'heatRating-desc'}
        key={'heatRating-desc'}
      >
        Heat Rating
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountDownAlt />}
        value={'heatRating-asc'}
        key={'heatRating-asc'}
      >
        Heat Rating
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountUp />}
        value={'createdAt-desc'}
        key={'createdAt-desc'}
      >
        Date Added
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountDownAlt />}
        value={'createdAt-asc'}
        key={'createdAt-asc'}
      >
        Date Added
      </SelectItem>
    </Select>
  );
}

export default ReviewSort;
