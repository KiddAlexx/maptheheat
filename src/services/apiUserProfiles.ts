import camelcaseKeys from 'camelcase-keys';
import supabase from './supabase';

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Profile could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data[0]);
}

export async function addFavouriteVenue({ venueId, userId }) {
  const { data: currentFavs, error: fetchError } = await supabase
    .from('profiles')
    .select('favourite_venues');

  if (fetchError) {
    throw new Error(
      `Error fetching current favourite venues: ${fetchError.message}`
    );
  }

  const updatedFavs =
    currentFavs.length > 0 ? [...currentFavs, venueId] : [venueId];

  const { data, error } = await supabase
    .from('profiles')
    .update('favourite_venues', updatedFavs)
    .eq('user_id', userId);

  if (error) {
    throw new Error(
      `Error adding favourite venue to database: ${error.message}`
    );
  }

  return data;
}
