import { useState } from 'react';
import { useMatch } from 'react-router-dom';
import { Icon } from '@iconify/react';
import VenueTypeFilter from './VenueTypeFilter';
import CitySelect from './CitySelect';
import VenueSort from './VenueSort';
import VenueSearchBar from './VenueSearchBar';
import TagFilter from './TagFilter';
import { CUISINE_TYPES, DIETARY_OPTIONS } from '@/shared/data/cuisineTypes';
import { VenueFilterContextType } from '@/context/VenueFilterContext';
import { getFilterValue } from '../utils/getFilterValue';

interface SearchAndFilerPanelProps {
  useVenueContext: () => VenueFilterContextType;
  favouriteVenues?: string[];
}

function SearchAndFilterPanel({
  useVenueContext,
  favouriteVenues,
}: SearchAndFilerPanelProps) {
  // isUserMode hides the search bar on the profile/favourites view
  const isUserMode = useMatch('/profile/venues');
  const { filters, updateVenueFilter, removeVenueFilter } = useVenueContext();

  const [filtersOpen, setFiltersOpen] = useState(false);

  // Selected tags are derived from the filter context (the single source of
  // truth) so the UI always reflects the applied filters, even after the panel
  // unmounts and remounts on navigation.
  const selectedCuisines = (getFilterValue(filters, 'cuisines') as string[]) ?? [];
  const selectedDietary = (getFilterValue(filters, 'dietaryOptions') as string[]) ?? [];

  // Total active tag count shown as a badge on the Filters button
  const activeTagCount = selectedCuisines.length + selectedDietary.length;

  // Toggles a single cuisine tag on/off in the filter context
  function toggleCuisine(tag: string) {
    const updatedCuisines = selectedCuisines.includes(tag)
      ? selectedCuisines.filter((existingTag) => existingTag !== tag)
      : [...selectedCuisines, tag];
    updatedCuisines.length > 0
      ? updateVenueFilter({ field: 'cuisines', value: updatedCuisines, method: 'overlaps' })
      : removeVenueFilter('cuisines');
  }

  // Toggles a single dietary option on/off in the filter context
  function toggleDietary(tag: string) {
    const updatedDietary = selectedDietary.includes(tag)
      ? selectedDietary.filter((existingTag) => existingTag !== tag)
      : [...selectedDietary, tag];
    updatedDietary.length > 0
      ? updateVenueFilter({ field: 'dietaryOptions', value: updatedDietary, method: 'overlaps' })
      : removeVenueFilter('dietaryOptions');
  }

  function clearAllTagFilters() {
    removeVenueFilter('cuisines');
    removeVenueFilter('dietaryOptions');
  }

  return (
    <div className="mb-5 rounded-xl border border-app-border bg-app-card p-4 shadow-md">
      {!isUserMode && <VenueSearchBar useVenueContext={useVenueContext} />}
      <CitySelect
        useVenueContext={useVenueContext}
        favouriteVenues={favouriteVenues}
      />
      <div className="flex flex-col-reverse gap-3 xs:flex-row">
        <VenueTypeFilter useVenueContext={useVenueContext} />
        <VenueSort useVenueContext={useVenueContext} />
      </div>

      {/* Tag filters — cuisine and dietary — collapsed by default to save space */}
      <div className="mt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((isOpen) => !isOpen)}
            className="flex items-center gap-1.5 rounded-full border border-app-border px-3 py-1 text-xs transition hover:border-primary hover:text-primary"
          >
            <Icon icon="lucide:sliders-horizontal" width={13} aria-hidden="true" />
            Filters
            {activeTagCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                {activeTagCount}
              </span>
            )}
            <Icon
              icon={filtersOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'}
              width={13}
              aria-hidden="true"
            />
          </button>

          {/* Clear all visible even when panel is closed so users can reset without opening */}
          {activeTagCount > 0 && (
            <button
              type="button"
              onClick={clearAllTagFilters}
              className="text-xs text-app-muted underline hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="mt-3 flex flex-col gap-4">
            <TagFilter
              label="Cuisine"
              tags={CUISINE_TYPES}
              selectedTags={selectedCuisines}
              onToggle={toggleCuisine}
              onClear={() => removeVenueFilter('cuisines')}
            />
            <TagFilter
              label="Dietary"
              tags={DIETARY_OPTIONS}
              selectedTags={selectedDietary}
              onToggle={toggleDietary}
              onClear={() => removeVenueFilter('dietaryOptions')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchAndFilterPanel;
