/* eslint-disable react-refresh/only-export-components */

//React imports
import { createContext, useContext, useReducer, ReactNode } from 'react';

// Data types
interface State {
  errorMessage: string | null;
}

interface RestaurantContextType extends State {
  clearError: () => void;
}

type Action = { type: 'clear-error' };

interface RestaurantProviderProps {
  children: ReactNode;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(
  undefined
);

const initialState = {
  errorMessage: null,
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'clear-error':
      return {
        ...state,
        errorMessage: null,
      };

    default:
      throw new Error('Unknown action type');
  }
}

function RestaurantsProvider({ children }: RestaurantProviderProps) {
  const [{ errorMessage }, dispatch] = useReducer(reducer, initialState);

  function clearError() {
    console.log('Clearing error...');
    dispatch({ type: 'clear-error' });
  }

  return (
    <RestaurantContext.Provider
      value={{
        errorMessage,
        clearError,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

// A custom hook to provide easy access to the RestaurantContext
function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined)
    throw new Error(
      'Restaurant context was used outside the RestaurantsProvider'
    );
  return context;
}

export { RestaurantsProvider, useRestaurants };
