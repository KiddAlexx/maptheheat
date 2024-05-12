/* eslint-disable react-refresh/only-export-components */

// React imports
import { ReactNode, createContext, useContext, useReducer } from 'react';

// Data types
interface Filter {
  field: string;
  value: string;
  method: string;
}

interface State {
  filters: Filter[];
}

interface VenueFilterContextType extends State {
  updateVenueFilter: (filter: Filter) => void;
  removeVenueFilter: (field: string) => void;
}

type Action =
  | { type: 'update-filter'; payload: { filter: Filter } }
  | {
      type: 'remove-filter';
      payload: { field: string };
    };

interface VenueFilterProviderProps {
  children: ReactNode;
}

const VenueFilterContext = createContext<VenueFilterContextType | undefined>(
  undefined
);

const initialState = {
  filters: [{ field: 'city', value: 'Barcelona', method: 'eq' }],
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'update-filter': {
      let matchedFilter = false;
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

function VenueFilterProvider({ children }: VenueFilterProviderProps) {
  const [{ filters }, dispatch] = useReducer(reducer, initialState);
  function updateVenueFilter(filter: Filter) {
    dispatch({ type: 'update-filter', payload: { filter } });
  }
  function removeVenueFilter(field: string) {
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

// A custom hook to provide easy access to the VenueFilterContex
function useVenueFilterContext() {
  const context = useContext(VenueFilterContext);
  if (context === undefined)
    throw new Error(
      'Venue filter context was used outside the VenueFilterProvider'
    );
  return context;
}

export { VenueFilterProvider, useVenueFilterContext };
