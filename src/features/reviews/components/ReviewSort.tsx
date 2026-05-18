// Assets
import { FaSortAmountDownAlt, FaSortAmountUp } from 'react-icons/fa';

// Components
import { Select, SelectItem } from '@heroui/react';

// Type imports
import type { Direction } from '@/types/commonTypes';
import type {
  ResetSort,
  ReviewSortField,
  UpdateSort,
} from '@/types/reviewTypes';

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
      radius="full"
      variant="bordered"
    >
      <SelectItem key={'default'}>Default</SelectItem>
      <SelectItem endContent={<FaSortAmountUp />} key={'heatRating-desc'}>
        Hottest
      </SelectItem>
      <SelectItem endContent={<FaSortAmountDownAlt />} key={'heatRating-asc'}>
        Mildest
      </SelectItem>
      <SelectItem endContent={<FaSortAmountUp />} key={'qualityRating-desc'}>
        Highest Quality
      </SelectItem>
      <SelectItem
        endContent={<FaSortAmountDownAlt />}
        key={'qualityRating-asc'}
      >
        Lowest Quality
      </SelectItem>
      <SelectItem endContent={<FaSortAmountUp />} key={'createdAt-desc'}>
        Newest first
      </SelectItem>
      <SelectItem endContent={<FaSortAmountDownAlt />} key={'createdAt-asc'}>
        Oldest first
      </SelectItem>
    </Select>
  );
}

export default ReviewSort;
