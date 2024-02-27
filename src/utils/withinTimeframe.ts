import { isAfter, subDays } from 'date-fns';

export function withinTimeframe(date, days) {
  const daysAfter = subDays(new Date(), days);
  return isAfter(date, daysAfter);
}
