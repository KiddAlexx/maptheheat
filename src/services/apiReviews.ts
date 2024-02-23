import decamelizeKeys from 'decamelize-keys';
import supabase from './supabase';
import camelcaseKeys from 'camelcase-keys';
import { subDays } from 'date-fns';

export async function getReviews(venueId: string) {
  const { data, error } = await supabase
    .from('venue_reviews')
    .select('*, profiles(*), venue_details(*)')
    .eq('venue_id', venueId);

  if (error) {
    throw new Error(`Reviews could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data, { deep: true });
}

export async function getReview(reviewId: string) {
  const { data, error } = await supabase
    .from('venue_reviews')
    .select('*, profiles(*), venue_details(*)')
    .eq('review_id', reviewId);

  if (error) {
    throw new Error(`Review could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data[0], { deep: true });
}

export async function canUserReview(userId, venueId, days) {
  const daysAfter = subDays(new Date(), days).toISOString();

  const { data, error } = await supabase
    .from('venue_reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('venue_id', venueId)
    .gt('created_at', daysAfter);
  if (error) {
    throw new Error(`Review could not be loaded. Error:${error.message}`);
  }
  console.log('here is the data', data);
  return data.length === 0;
}

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

export async function updateReview(finalFormData, reviewId) {
  console.log(finalFormData);
  console.log(reviewId);
  const convertedReview = decamelizeKeys(finalFormData);
  const { data, error } = await supabase
    .from('venue_reviews')
    .update({ ...convertedReview })
    .eq('review_id', reviewId)
    .select();

  if (error) {
    throw new Error(`Review could not be updated' Error ${error.message}`);
  }
  return camelcaseKeys(data, { deep: true });
}

export async function deleteReview(reviewId: string) {
  const { data, error } = await supabase
    .from('venue_reviews')
    .delete()
    .eq('review_id', reviewId);

  if (error) {
    throw new Error(`Review could not be deleted. Error: ${error.message}`);
  }
  return data;
}
