import decamelizeKeys from 'decamelize-keys';
import supabase from './supabase';
import camelcaseKeys from 'camelcase-keys';

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

export async function getReviews(venueId: string) {
  const { data, error } = await supabase
    .from('venue_reviews')
    .select('*')
    .eq('venue_id', venueId);

  if (error) {
    throw new Error(`Reviews could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data);
}
