import { UniqueCity } from '@/types/venueTypes';

export function getModerationCityKey(city: UniqueCity) {
  return `${city.city}|${city.country}`;
}
