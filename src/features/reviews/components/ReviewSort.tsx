import { Direction } from '@/types/commonTypes';
import { ResetSort, ReviewSortField, UpdateSort } from '@/types/reviewTypes';

import { Select, SelectItem } from '@heroui/react';

import { FaSortAmountDownAlt, FaSortAmountUp } from 'react-icons/fa';

interface ReviewSortParams {
  updateSort: UpdateSort;
  resetSort: ResetSort;
}

function ReviewSort({ updateSort, resetSort }: ReviewSortParams) {
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
    <Select
      className="max-w-60"
      onChange={handleChange}
      label={'Sort by'}
      size="sm"
    >
      <SelectItem key={'default'}>Default</SelectItem>
      <SelectItem endContent={<FaSortAmountUp />} key={'heatRating-desc'}>
        Heat Rating
      </SelectItem>
      <SelectItem endContent={<FaSortAmountDownAlt />} key={'heatRating-asc'}>
        Heat Rating
      </SelectItem>
      <SelectItem endContent={<FaSortAmountUp />} key={'qualityRating-desc'}>
        Quality Rating
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountDownAlt />}
        key={'qualityRating-asc'}
      >
        Quality Rating
      </SelectItem>
      <SelectItem endContent={<FaSortAmountUp />} key={'createdAt-desc'}>
        Date Added
      </SelectItem>
      <SelectItem endContent={<FaSortAmountDownAlt />} key={'createdAt-asc'}>
        Date Added
      </SelectItem>
    </Select>
  );
}

export default ReviewSort;
