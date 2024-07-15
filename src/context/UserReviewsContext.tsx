/* eslint-disable react-refresh/only-export-components */

// React imports
import { createContext, ReactNode, useContext, useReducer } from 'react';
import {
  ResetSort,
  ReviewPaginationParams,
  ReviewSort,
  UpdatePageNumber,
  UpdateSort,
} from '@/types/reviewTypes';

// Data types

interface State {
  sort: ReviewSort | null;
  pagination: ReviewPaginationParams;
}

interface UserReviewsContextType extends State {
  updateSort: UpdateSort;
  resetSort: ResetSort;
  updatePageNumber: UpdatePageNumber;
}

type Action =
  | { type: 'update-sort'; payload: { sortBy: ReviewSort } }
  | { type: 'reset-sort' }
  | { type: 'update-page'; payload: number };

interface UserReviewsProviderProps {
  children: ReactNode;
}

const UserReviewsContext = createContext<UserReviewsContextType | undefined>(
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

function UserReviewsProvider({ children }: UserReviewsProviderProps) {
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
    <UserReviewsContext.Provider
      value={{ sort, pagination, updateSort, resetSort, updatePageNumber }}
    >
      {children}
    </UserReviewsContext.Provider>
  );
}

// A custom hook to provide easy access to the UserReviewsContext
function useUserReviewsContext() {
  const context = useContext(UserReviewsContext);
  if (context === undefined)
    throw new Error(
      'User Reviews context was used outside the UserReviewsProvider'
    );
  return context;
}

export { UserReviewsProvider, useUserReviewsContext };
