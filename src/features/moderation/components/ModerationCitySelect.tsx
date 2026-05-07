import { ChangeEvent } from 'react';
import { UniqueCity } from '@/types/venueTypes';
import { getModerationCityKey } from './moderationCityKey';

interface ModerationCitySelectProps {
  cities?: UniqueCity[];
  label?: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  value: string;
}

function ModerationCitySelect({
  cities,
  label = 'City',
  onChange,
  value,
}: ModerationCitySelectProps) {
  return (
    <label className="flex flex-col gap-1 font-medium text-gray-700">
      {label}
      <select
        value={value}
        onChange={onChange}
        className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm font-normal text-gray-800 shadow-sm outline-none transition focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
      >
        <option value="all">All cities</option>
        {cities?.map((city) => (
          <option
            key={getModerationCityKey(city)}
            value={getModerationCityKey(city)}
          >
            {city.city} - {city.country}
          </option>
        ))}
      </select>
    </label>
  );
}

export default ModerationCitySelect;
