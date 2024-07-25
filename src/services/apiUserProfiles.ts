import camelcaseKeys from 'camelcase-keys';
import supabase from './supabase';

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Profile could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data[0]);
}

export interface UpdateUsernameParams {
  username: string;
}

export async function updateUsernameApi({ username }: UpdateUsernameParams) {
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError)
    throw new Error(`No authenticated user found: ${authError.message}`);
  const userId = user?.user?.id;
  const { data, error } = await supabase
    .from('profiles')
    .update({ username: username })
    .match({ user_id: userId });
  if (error?.message.includes('profiles_username_key')) {
    throw new Error(`This username is already taken. Please choose another`);
  }
  if (error) throw new Error(`Error updating username: ${error.message}`);
  return data;
}

export interface AddFavouriteVenueParams {
  venueId: string;
  userId: string;
}

export async function updateFavouriteVenue({
  venueId,
  userId,
}: AddFavouriteVenueParams) {
  // Fetch row based on userId + return favourite_venues
  const { data: currentFavs, error: fetchError } = await supabase
    .from('profiles')
    .select('favourite_venues')
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    throw new Error(
      `Error fetching current favourite venues: ${fetchError.message}`
    );
  }

  // Create an empty array when favourite_venues is null
  const currentFavsArray: string[] = currentFavs.favourite_venues || [];

  // Toggle presence of venueId in the favourites array
  const updatedFavs = currentFavsArray.includes(venueId)
    ? currentFavsArray.filter((id) => id !== venueId)
    : [...currentFavsArray, venueId];

  // Update profiles table with new favourite_venues list
  const { data, error } = await supabase
    .from('profiles')
    .update({ favourite_venues: updatedFavs })
    .eq('user_id', userId);

  if (error) {
    throw new Error(
      `Error adding favourite venue to database: ${error.message}`
    );
  }

  return data;
}
