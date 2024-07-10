/* eslint-disable react-refresh/only-export-components */

// React imports
import { createContext, ReactNode, useContext, useReducer } from 'react';
import { Direction } from './VenueFilterContext';

// Data types

export type ReviewSortField = 'averageRating' | 'createdAt';

export interface ReviewSort {
  field: ReviewSortField;
  direction: Direction;
}

export interface ReviewPagination {
  pageNumber: number;
  maxResults: number;
}

interface State {
  sort: ReviewSort | null;
  pagination: ReviewPagination;
}

interface ReviewFilterContextType extends State {
  updateSort: (sortBy: ReviewSort) => void;
  resetSort: () => void;
  updatePageNumber: (pageNumber: number) => void;
}

type Action =
  | { type: 'update-sort'; payload: { sortBy: ReviewSort } }
  | { type: 'reset-sort' }
  | { type: 'update-page'; payload: number };

interface ReviewFilterProviderProps {
  children: ReactNode;
}

const ReviewSortContext = createContext<ReviewFilterContextType | undefined>(
  undefined
);

const initialState: State = {
  sort: null,
  pagination: { pageNumber: 1, maxResults: 5 },
};

function reducer(state: State, action: Action) {
  switch (action.type) {
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

function ReviewSortProvider({ children }: ReviewFilterProviderProps) {
  const [{ sort, pagination }, dispatch] = useReducer(reducer, initialState);

  // Function to update sort
  function updateSort(sortBy: ReviewSort) {
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
    <ReviewSortContext.Provider
      value={{ sort, pagination, updateSort, resetSort, updatePageNumber }}
    >
      {children}
    </ReviewSortContext.Provider>
  );
}

// A custom hook to provide easy access to the VenueFilterContext
function useReviewSortContext() {
  const context = useContext(ReviewSortContext);
  if (context === undefined)
    throw new Error(
      'Review Sort context was used outside the ReviewSortProvider'
    );
  return context;
}

export { ReviewSortProvider, useReviewSortContext };
