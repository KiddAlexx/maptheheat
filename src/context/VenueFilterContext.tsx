/* eslint-disable react-refresh/only-export-components */

// React imports
import { ReactNode, createContext, useContext, useReducer } from 'react';

// Data types

type FilterField = 'city' | 'venueType';

type SupabaseQueryMethod =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'is'
  | 'in'
  | 'not'
  | 'isnull'
  | 'notnull'
  | 'between'
  | 'nbetween'
  | 'match';

interface Filter {
  field: FilterField;
  value: string;
  method: SupabaseQueryMethod;
}

interface State {
  filters: Filter[];
}

interface VenueFilterContextType extends State {
  updateVenueFilter: (filter: Filter) => void;
  removeVenueFilter: (field: FilterField) => void;
}

type Action =
  | { type: 'update-filter'; payload: { filter: Filter } }
  | {
      type: 'remove-filter';
      payload: { field: FilterField };
    };

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
    default:
      return state;
  }
}

// Context provider component
function VenueFilterProvider({ children }: VenueFilterProviderProps) {
  const [{ filters }, dispatch] = useReducer(reducer, initialState);

  // Function to update filter
  function updateVenueFilter(filter: Filter) {
    dispatch({ type: 'update-filter', payload: { filter } });
  }
  // Function to remove filter
  function removeVenueFilter(field: FilterField) {
    dispatch({ type: 'remove-filter', payload: { field } });
  }
  return (
    <VenueFilterContext.Provider
      value={{
        filters,
        updateVenueFilter,
        removeVenueFilter,
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
