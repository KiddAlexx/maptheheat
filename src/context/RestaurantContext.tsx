/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect } from 'react';
import { db } from '../config/firebase-config';
import { getDocs, collection, addDoc } from 'firebase/firestore';

const restaurantCollectionRef = collection(db, 'restaurant-details');

const RestaurantContext = createContext();

const initialState = {
  restaurants: [],
  isLoading: false,
  errorMessage: '',
  activeRestaurant: { id: '', coords: { lat: '', lon: '' } },
};

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };
    case 'restaurants/loaded':
      return { ...state, isLoading: false, restaurants: action.payload };
    case 'rejected':
      return {
        ...state,
        isLoading: false,
        errorMessage: action.payload,
      };
    case 'set-active':
      return {
        ...state,
        activeRestaurant: {
          id: action.payload.id,
          coords: action.payload.coords,
        },
      };

    default:
      throw new Error('Unknown action type');
  }
}

function RestaurantsProvider({ children }) {
  const [{ restaurants, isLoading, errorMessage, activeRestaurant }, dispatch] =
    useReducer(reducer, initialState);

  // Ensure restaurant list is fetched on initial load.
  useEffect(function () {
    getRestaurants();
  }, []);

  async function getRestaurants() {
    try {
      dispatch({ type: 'loading' });
      const data = await getDocs(restaurantCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      dispatch({ type: 'restaurants/loaded', payload: filteredData });
    } catch {
      dispatch({
        type: 'rejected',
        payload: 'There was an error loading restaurants',
      });
    }
  }

  async function addRestaurant(restaurant) {
    try {
      dispatch({ type: 'loading' });
      await addDoc(restaurantCollectionRef, restaurant);
    } catch (err) {
      dispatch({
        type: 'rejected',
        payload: err,
      });
    }
  }

  function setActiveRestaurant(restaurant) {
    dispatch({ type: 'set-active', payload: restaurant });
  }

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        isLoading,
        errorMessage,
        activeRestaurant,
        getRestaurants,
        addRestaurant,
        setActiveRestaurant,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

// A custom hook to provide easy access to the RestaurantContext.
function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined)
    throw new Error(
      'Restaurant context was used outside the RestaurantsProvider'
    );
  return context;
}

export { RestaurantsProvider, useRestaurants };
