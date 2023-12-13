import { NewRestaurant } from '../models/restaurantTypes';
import supabase from './supabase';

export async function getRestaurants() {
  const { data, error } = await supabase.from('restaurant-details').select('*');

  if (error) {
    throw new Error('Restaurants could not be loaded');
  }
  return data;
}

export async function createRestaurant(newRestaurant: NewRestaurant) {
  console.log('Creating restaurant with data:', newRestaurant);
  const { data, error } = await supabase
    .from('restaurant-details')
    .insert(newRestaurant)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Restaurant could not be created. Error:${error.message}`);
  }
  return data;
}
