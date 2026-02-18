import { isAfter, subDays, format, parseISO } from 'date-fns';

export function withinTimeframe(date: Date, days: number): boolean {
  const daysAfter = subDays(new Date(), days);
  return isAfter(date, daysAfter);
}

export function formatDate(date: string) {
  return format(parseISO(date), 'dd MMM yyyy');
}
