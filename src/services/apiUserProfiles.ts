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
