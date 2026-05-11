import { Select, SelectItem } from '@heroui/react';
import { UniqueCity } from '@/types/venueTypes';
import { getModerationCityKey } from './moderationCityKey';

interface ModerationCitySelectProps {
  cities?: UniqueCity[];
  label?: string;
  onChange: (value: string) => void;
  value: string;
}

const ALL_CITIES_KEY = 'all';
const ALL_CITIES_LABEL = 'All cities';

function ModerationCitySelect({
  cities,
  label = 'City',
  onChange,
  value,
}: ModerationCitySelectProps) {
  const items = [
    { key: ALL_CITIES_KEY, label: ALL_CITIES_LABEL },
    ...(cities ?? []).map((city) => ({
      key: getModerationCityKey(city),
      label: `${city.city} - ${city.country}`,
    })),
  ];

  return (
    <Select
      label={label}
      labelPlacement="outside"
      radius="full"
      variant="bordered"
      selectedKeys={new Set([value])}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        onChange(typeof next === 'string' ? next : ALL_CITIES_KEY);
      }}
      classNames={{ label: 'text-md font-normal ml-1' }}
    >
      {items.map((item) => (
        <SelectItem key={item.key}>{item.label}</SelectItem>
      ))}
    </Select>
  );
}

export default ModerationCitySelect;
