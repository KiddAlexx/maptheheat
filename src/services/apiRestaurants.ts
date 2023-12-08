import supabase from './supabase';

export async function getRestaurants() {
  const { data, error } = await supabase.from('restaurant-details').select('*');

  if (error) {
    throw new Error('Restaurants could not be loaded');
  }
  return data;
}
