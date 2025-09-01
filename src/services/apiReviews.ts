//Third Party Imports
import decamelizeKeys from 'decamelize-keys';
import camelcaseKeys from 'camelcase-keys';
import decamelize from 'decamelize';
import { subDays } from 'date-fns';
import supabase from './supabase';

import { EditformData } from '../features/reviews/components/ReviewForm';

//Type Imports
import {
  NewReview,
  ReviewSort,
  ReviewWithRelations,
} from '@/types/reviewTypes';
import { PaginationControlsParams } from '@/ui/PaginationControls';

export interface ReviewsRequestParams {
  venueId?: string;
  userId?: string;
  sort?: ReviewSort | null;
  pagination?: PaginationControlsParams;
}

export interface ReviewsResponse {
  data: ReviewWithRelations[];
  count: number | null;
}

// Function to fetch reviews matching a specific venue
// or specific user
export async function getReviews({
  venueId,
  userId,
  sort,
  pagination,
}: ReviewsRequestParams): Promise<ReviewsResponse> {
  let query = supabase
    .from('venue_reviews')
    .select('*, profiles(*), venue_details(*)', { count: 'exact' })
    .eq('status', 'approved');

  // Apply venueId or userId filter
  if (venueId) {
    query = query.eq('venue_id', venueId);
  }
  if (userId) {
    query = query.eq('user_id', userId);
  }

  // Apply sort value + direction
  if (sort) {
    const convertedSortField = decamelize(sort.field);
    query = query.order(convertedSortField, {
      ascending: sort.direction === 'asc',
    });
  }

  // Apply pagination
  if (pagination) {
    const { pageNumber, maxResults } = pagination;
    const from = (pageNumber - 1) * maxResults;
    const to = from + maxResults - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Reviews could not be loaded. Error:${error.message}`);
  }

  return { data: camelcaseKeys(data, { deep: true }), count };
}

// Function to fetch single review matching review id
export async function getReview(
  reviewId: string
): Promise<ReviewWithRelations> {
  const { data, error } = await supabase
    .from('venue_reviews')
    .select('*, profiles(*), venue_details(*)')
    .eq('review_id', reviewId)
    .eq('status', 'approved');

  if (error) {
    throw new Error(`Review could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data[0], { deep: true });
}

// Function to check whether user has left a review for specified venue
// within number of days provided
export async function canUserReview(
  userId: string,
  venueId: string,
  days: number
) {
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

  return data.length === 0;
}

// Function to create a new review
export async function createReview(newReview: NewReview) {
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
  return camelcaseKeys(data);
}

// Function to update a review
export async function updateReview(
  finalFormData: EditformData,
  reviewId: string
) {
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

// Function to delete a review
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
