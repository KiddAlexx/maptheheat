import { createContext } from 'react';
import { db } from '../config/firebase-config';
import { getDocs, collection } from 'firebase/firestore';

const restaurantCollectionRef = collection(db, 'restaurant-details');

const RestaurantContext = createContext();

function RestaurantsProvider({ children }) {
  return <RestaurantContext.Provider></RestaurantContext.Provider>;
}

function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined)
    throw new Error(
      'Restaurant context was used outside the RestaurantsProvider'
    );
  return context;
}
