/* eslint-disable react-refresh/only-export-components */

// React imports
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';

// Type imports
import type {
  FilterField,
  VenueFilter,
  VenuePagination,
  VenueSort,
} from '@/types/venueTypes';

interface State {
  filters: VenueFilter[];
  sort: VenueSort | null;
  pagination: VenuePagination;
}

export interface UserAddedVenuesContextType extends State {
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

interface UserAddedVenuesProviderProps {
  children: ReactNode;
}

const UserAddedVenuesContext = createContext<
  UserAddedVenuesContextType | undefined
>(undefined);

const initialState: State = {
  filters: [],
  sort: null,
  pagination: { pageNumber: 1, maxResults: 10 },
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

function UserAddedVenuesProvider({ children }: UserAddedVenuesProviderProps) {
  const [{ filters, sort, pagination }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const updateVenueFilter = useCallback(
    (filter: VenueFilter) => {
      dispatch({ type: 'update-filter', payload: { filter } });
    },
    [dispatch]
  );

  const removeVenueFilter = useCallback(
    (field: FilterField) => {
      dispatch({ type: 'remove-filter', payload: { field } });
    },
    [dispatch]
  );

  const updateSort = useCallback(
    (sortBy: VenueSort) => {
      dispatch({ type: 'update-sort', payload: { sortBy } });
    },
    [dispatch]
  );

  const resetSort = useCallback(() => {
    dispatch({ type: 'reset-sort' });
  }, [dispatch]);

  const updatePageNumber = useCallback(
    (pageNumber: number) => {
      dispatch({ type: 'update-page', payload: pageNumber });
    },
    [dispatch]
  );

  const value = useMemo(
    () => ({
      filters,
      sort,
      pagination,
      updateVenueFilter,
      removeVenueFilter,
      updateSort,
      resetSort,
      updatePageNumber,
    }),
    [
      filters,
      sort,
      pagination,
      updateVenueFilter,
      removeVenueFilter,
      updateSort,
      resetSort,
      updatePageNumber,
    ]
  );

  return (
    <UserAddedVenuesContext.Provider value={value}>
      {children}
    </UserAddedVenuesContext.Provider>
  );
}

function useUserAddedVenuesContext() {
  const context = useContext(UserAddedVenuesContext);
  if (context === undefined)
    throw new Error(
      'Added venues context was used outside the UserAddedVenuesProvider'
    );
  return context;
}

export { UserAddedVenuesProvider, useUserAddedVenuesContext };
