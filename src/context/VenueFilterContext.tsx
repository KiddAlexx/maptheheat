/* eslint-disable react-refresh/only-export-components */

// React imports
import VenueSort from '@/features/venues/components/VenueSort';
import { ReactNode, createContext, useContext, useReducer } from 'react';

// Data types

type FilterField = 'city' | 'venueType';
export type SortField = 'averageRating' | 'totalReviews' | 'createdAt';

type SupabaseQueryMethod = 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
export type Direction = 'asc' | 'desc';

export interface VenueFilter {
  field: FilterField;
  value: string;
  method: SupabaseQueryMethod;
}

export interface VenueSort {
  field: SortField;
  direction: Direction;
}

export interface VenuePagination {
  pageNumber: number;
  maxResults: number;
}

interface State {
  filters: VenueFilter[];
  sort: VenueSort | null;
  pagination: VenuePagination;
}

interface VenueFilterContextType extends State {
  updateVenueFilter: (filter: VenueFilter) => void;
  removeVenueFilter: (field: FilterField) => void;
  updateSort: (sortBy: VenueSort) => void;
  resetSort: () => void;
}

type Action =
  | { type: 'update-filter'; payload: { filter: VenueFilter } }
  | {
      type: 'remove-filter';
      payload: { field: FilterField };
    }
  | { type: 'update-sort'; payload: { sortBy: VenueSort } }
  | { type: 'reset-sort' };

interface VenueFilterProviderProps {
  children: ReactNode;
}

// Create a context with an undefined default value
const VenueFilterContext = createContext<VenueFilterContextType | undefined>(
  undefined
);

// Initial state for the filters
const initialState: State = {
  filters: [{ field: 'city', value: 'Barcelona', method: 'eq' }],
  sort: null,
  pagination: { pageNumber: 1, maxResults: 10 },
};

// Reducer function to handle filter updates and removals
function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'update-filter': {
      // Track if an existing filter was updated
      let matchedFilter = false;

      // Update existing filters or add a new one
      const updatedFilters = state.filters.map((currentFilter) => {
        if (currentFilter.field === action.payload.filter.field) {
          matchedFilter = true;
          return {
            ...currentFilter,
            value: action.payload.filter.value,
            method: action.payload.filter.method,
          };
        }
        return currentFilter;
      });

      // If no existing filter was updated, add the new filter
      if (!matchedFilter) {
        updatedFilters.push(action.payload.filter);
      }

      return {
        ...state,
        filters: updatedFilters,
      };
    }
    case 'remove-filter': {
      // Remove a filter by its field name
      return {
        ...state,
        filters: state.filters.filter(
          (filter) => filter.field !== action.payload.field
        ),
      };
    }

    // Update sort field / direction
    case 'update-sort': {
      return {
        ...state,
        sort: action.payload.sortBy,
      };
    }

    // Reset sort to null
    case 'reset-sort': {
      return {
        ...state,
        sort: null,
      };
    }
    default:
      return state;
  }
}

// Context provider component
function VenueFilterProvider({ children }: VenueFilterProviderProps) {
  const [{ filters, sort, pagination }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // Function to update filter
  function updateVenueFilter(filter: VenueFilter) {
    dispatch({ type: 'update-filter', payload: { filter } });
  }

  // Function to remove filter
  function removeVenueFilter(field: FilterField) {
    dispatch({ type: 'remove-filter', payload: { field } });
  }
  // Function to update sort
  function updateSort(sortBy: VenueSort) {
    dispatch({ type: 'update-sort', payload: { sortBy } });
  }
  // Function to reset sort to null
  function resetSort() {
    dispatch({ type: 'reset-sort' });
  }
  return (
    <VenueFilterContext.Provider
      value={{
        filters,
        sort,
        pagination,
        updateVenueFilter,
        removeVenueFilter,
        updateSort,
        resetSort,
      }}
    >
      {children}
    </VenueFilterContext.Provider>
  );
}

// A custom hook to provide easy access to the VenueFilterContext
function useVenueFilterContext() {
  const context = useContext(VenueFilterContext);
  if (context === undefined)
    throw new Error(
      'Venue filter context was used outside the VenueFilterProvider'
    );
  return context;
}

export { VenueFilterProvider, useVenueFilterContext };
