import { db } from '../config/firebase-config';
import { getDocs, collection } from 'firebase/firestore';

import { useState, useEffect } from 'react';

const restaurantCollectionRef = collection(db, 'restaurant-details');

function AppLayout() {
  const [restaurantList, setRestaurantList] = useState([]);

  useEffect(() => {
    const getMovieList = async () => {
      try {
        const data = await getDocs(restaurantCollectionRef);
        const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setRestaurantList(filteredData);
      } catch (err) {
        console.error(err);
      }
    };
    getMovieList();
  }, []);

  return <div>App Layout</div>;
}

export default AppLayout;
