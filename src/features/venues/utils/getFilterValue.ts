import type { FilterField, VenueFilter } from '@/types/venueTypes';

// Reads the current value for a given filter field out of the context's
// filters array. Returns undefined when the field is not currently filtered.
// Callers narrow the result (`as string` / `as string[]`) to the shape they expect.
export function getFilterValue(filters: VenueFilter[], field: FilterField) {
  return filters.find((filter) => filter.field === field)?.value;
}
