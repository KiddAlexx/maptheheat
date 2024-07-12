import { isAfter, subDays } from 'date-fns';

export function withinTimeframe(date: Date, days: number): boolean {
  const daysAfter = subDays(new Date(), days);
  return isAfter(date, daysAfter);
}
