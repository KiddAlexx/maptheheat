import { db } from '../config/firebase-config';
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { useState, useEffect } from 'react';

const restaurantCollectionRef = collection(db, 'restaurant-details');

function AppLayout() {
  const [restaurantList, setRestaurantList] = useState([]);
  console.log(restaurantList);

  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [newRestaurantAddress, setNewRestaurantAddress] = useState('');

  useEffect(() => {
    const getRestaurantList = async () => {
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
    getRestaurantList();
  }, []);

  const onSubmitRestaurant = async (e) => {
    e.preventDefault();
    try {
      await addDoc(restaurantCollectionRef, {
        restaurantName: newRestaurantName,
        restaurantAddress: newRestaurantAddress,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRestaurant = async (id) => {
    const restaurantDoc = doc(db, 'restaurant-details', id);
    await deleteDoc(restaurantDoc);
  };
  const updateRestaurant = async (id) => {
    const restaurantDoc = doc(db, 'restaurant-details', id);
    await updateDoc(restaurantDoc, { restaurantName: updatedRestaurantName });
  };

  return (
    <form onSubmit={onSubmitRestaurant}>
      <input
        type="text"
        placeholder="name"
        onChange={(e) => setNewRestaurantName(e.target.value)}
      />
      <input
        type="text"
        placeholder="address"
        onChange={(e) => setNewRestaurantAddress(e.target.value)}
      />
      <button>submit</button>
    </form>
  );
}

export default AppLayout;
