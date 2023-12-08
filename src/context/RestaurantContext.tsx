/* eslint-disable react-refresh/only-export-components */

//React imports
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';

// Firebase imports
import { db } from '../config/firebase-config';
import {
  getDocs,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  doc,
} from 'firebase/firestore';

// Type imports
import {
  Restaurant,
  RestaurantContextType,
  State,
  Action,
  NewRestaurant,
} from '../models/restaurantTypes';

const restaurantCollectionRef = collection(db, 'restaurant-details');

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

  // Ensure restaurant list is fetched on initial load
  useEffect(function () {
    getRestaurants();
  }, []);

  async function getRestaurants() {
    try {
      dispatch({ type: 'loading' });
      const data = await getDocs(restaurantCollectionRef);
      const filteredData: Restaurant[] = data.docs.map((doc) => ({
        // This ensures TypeScript treats this as a Restaurant type, minus the id property
        ...(doc.data() as Omit<Restaurant, 'id'>),
        id: doc.id,
      }));
      dispatch({ type: 'restaurants/loaded', payload: filteredData });
    } catch (err) {
      dispatch({
        type: 'rejected',
        payload: 'There was an error loading restaurants, please refresh',
      });
    }
  }

  async function addRestaurant(restaurant: NewRestaurant) {
    try {
      dispatch({ type: 'loading' });
      await addDoc(restaurantCollectionRef, restaurant);
    } catch (err) {
      dispatch({
        type: 'rejected',
        payload: 'There was an error adding that restaurant, please try again',
      });
    }
  }

  async function updateRestaurantImages(id: string, imageURL: string) {
    try {
      dispatch({ type: 'loading' });
      const restaurantDocRef = doc(db, 'restaurant-details', id);
      await updateDoc(restaurantDocRef, { images: arrayUnion(imageURL) });

      // Update image URL in local restaurants state
      const updatedRestaurants = restaurants.map((restaurant) => {
        if (restaurant.id === id) {
          return {
            ...restaurant,
            // Check if image array containes values before spreading
            images: restaurant.images
              ? [...restaurant.images, imageURL]
              : [imageURL],
          };
        }
        return restaurant;
      });
      dispatch({ type: 'restaurants/loaded', payload: updatedRestaurants });

      // Update the active restaurant to trigger re-load
      const updatedActiveRestaurant = updatedRestaurants.find(
        (restaurant) => restaurant.id === id
      );
      if (updatedActiveRestaurant) {
        setActiveRestaurant(updatedActiveRestaurant);
      }
    } catch (err) {
      dispatch({
        type: 'rejected',
        payload: 'There was an error adding restaurant image, please try again',
      });
    }
  }

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
        getRestaurants,
        addRestaurant,
        setActiveRestaurant,
        updateRestaurantImages,
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
