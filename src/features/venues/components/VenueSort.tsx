import { Select, SelectItem } from '@nextui-org/react';
import { FaSortAmountDownAlt, FaSortAmountUp } from 'react-icons/fa';
import styles from '../styles/VenueSort.module.css';

function VenueSort() {
  return (
    <Select>
      <SelectItem endContent={<FaSortAmountUp />}>Heat Rating</SelectItem>
      <SelectItem endContent={<FaSortAmountDownAlt />}>Heat Rating</SelectItem>
      <SelectItem endContent={<FaSortAmountUp />}>Review Count</SelectItem>
      <SelectItem endContent={<FaSortAmountDownAlt />}>Review Count</SelectItem>
    </Select>
  );
}

export default VenueSort;
