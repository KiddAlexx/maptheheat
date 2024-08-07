/* eslint-disable react-refresh/only-export-components */

// React imports
import {
  FilterField,
  VenueFilter,
  VenuePagination,
  VenueSort,
} from '@/types/venueTypes';
import { ReactNode, createContext, useContext, useReducer } from 'react';

// Data types

interface State {
  filters: VenueFilter[];
  sort: VenueSort | null;
  pagination: VenuePagination;
  mode: 'user';
}

interface UserFavVenuesContextType extends State {
  updateVenueFilter: (filter: VenueFilter) => void;
  removeVenueFilter: (field: FilterField) => void;
  updateSort: (sortBy: VenueSort) => void;
  resetSort: () => void;
  updatePageNumber: (pageNumber: number) => void;
}

type Action =
  | { type: 'update-filter'; payload: { filter: VenueFilter } }
  | {
      type: 'remove-filter';
      payload: { field: FilterField };
    }
  | { type: 'update-sort'; payload: { sortBy: VenueSort } }
  | { type: 'reset-sort' }
  | { type: 'update-page'; payload: number };

interface UserFavVenuesProviderProps {
  children: ReactNode;
}

// Create a context with an undefined default value
const UserFavVenuesContext = createContext<
  UserFavVenuesContextType | undefined
>(undefined);

// Initial state for the filters
const initialState: State = {
  filters: [],
  sort: null,
  pagination: { pageNumber: 1, maxResults: 5 },
  mode: 'user',
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
        pagination: {
          ...state.pagination,
          pageNumber: 1,
        },
      };
    }
    case 'remove-filter': {
      // Remove a filter by its field name
      return {
        ...state,
        filters: state.filters.filter(
          (filter) => filter.field !== action.payload.field
        ),
        pagination: {
          ...state.pagination,
          pageNumber: 1,
        },
      };
    }

    // Update sort field / direction
    case 'update-sort': {
      return {
        ...state,
        sort: action.payload.sortBy,
        pagination: {
          ...state.pagination,
          pageNumber: 1,
        },
      };
    }

    // Reset sort to null
    case 'reset-sort': {
      return {
        ...state,
        sort: null,
        pagination: {
          ...state.pagination,
          pageNumber: 1,
        },
      };
    }
    // Update page number
    case 'update-page': {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          pageNumber: action.payload,
        },
      };
    }
    default:
      return state;
  }
}

// Context provider component
function UserFavVenuesProvider({ children }: UserFavVenuesProviderProps) {
  const [{ filters, sort, pagination, mode }, dispatch] = useReducer(
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
  // Function to update page number
  function updatePageNumber(pageNumber: number) {
    dispatch({ type: 'update-page', payload: pageNumber });
  }
  return (
    <UserFavVenuesContext.Provider
      value={{
        filters,
        sort,
        pagination,
        mode,
        updateVenueFilter,
        removeVenueFilter,
        updateSort,
        resetSort,
        updatePageNumber,
      }}
    >
      {children}
    </UserFavVenuesContext.Provider>
  );
}

// A custom hook to provide easy access to the VenueFilterContext
function useUserFavVenuesContext() {
  const context = useContext(UserFavVenuesContext);
  if (context === undefined)
    throw new Error(
      'Venue filter context was used outside the UserFavVenuesProvider'
    );
  return context;
}

export { UserFavVenuesProvider, useUserFavVenuesContext };
