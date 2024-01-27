/* eslint-disable react-refresh/only-export-components */

//React imports
import { createContext, useContext, useReducer, ReactNode } from 'react';

// Type imports
import {
  Restaurant,
  RestaurantContextType,
  State,
  Action,
  NewRestaurant,
} from '../models/restaurantTypes';

const RestaurantContext = createContext<RestaurantContextType | undefined>(
  undefined
);

const initialState = {
  restaurants: [],
  isLoading: false,
  errorMessage: null,
  activeRestaurant: null,
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    // Used to set active restaurant, to help sync components
    case 'set-active':
      return {
        ...state,
        activeRestaurant: action.payload,
      };
    case 'clear-error':
      return {
        ...state,
        errorMessage: null,
      };

    default:
      throw new Error('Unknown action type');
  }
}

function RestaurantsProvider({ children }: { children: ReactNode }) {
  const [{ restaurants, isLoading, errorMessage, activeRestaurant }, dispatch] =
    useReducer(reducer, initialState);

  // Used to set active restaurant, to help sync components
  function setActiveRestaurant(restaurant: Restaurant) {
    dispatch({ type: 'set-active', payload: restaurant });
  }

  function clearError() {
    console.log('Clearing error...');
    dispatch({ type: 'clear-error' });
  }

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        isLoading,
        errorMessage,
        activeRestaurant,
        setActiveRestaurant,
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
