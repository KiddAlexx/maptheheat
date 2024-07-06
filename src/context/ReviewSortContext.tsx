import { createContext, useContext, useReducer } from 'react';

const ReviewSortContext = createContext(undefined);

const initialState = {
  sort: null,
  pagination: { pageNumber: 1, maxResults: 10 },
};

function reducer(state, action) {
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

function ReviewSortProvider({ children }) {
  const [{ sort, pagination }, dispatch] = useReducer(reducer, initialState);

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
