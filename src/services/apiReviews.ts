import decamelizeKeys from 'decamelize-keys';
import supabase from './supabase';

export async function createReview(newReview) {
  const convertedReview = decamelizeKeys(newReview);
  const { data, error } = await supabase
    .from('venue_reviews')
    .insert(convertedReview)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Review could not be created. Error:${error.message}`);
  }
  return data;
}
