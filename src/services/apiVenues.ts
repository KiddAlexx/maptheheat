// Third Party Imports
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';
import decamelize from 'decamelize';
import supabase, { supabaseUrl } from './supabase';

// Type Imports
import {
  ImageUploadParams,
  NewVenue,
  Venue,
  VenueFilter,
  VenuePagination,
  VenueSort,
} from '../types/venueTypes';

// Util Imports
import compressImage from '../utils/compressImage';
import uploadImages from './supabaseImageUploader';

export interface VenuesRequestParams {
  filters: VenueFilter[];
  sort?: VenueSort | null;
  pagination?: VenuePagination;
  favouriteVenues?: string[];
}

export interface VenuesResponse {
  data: Venue[];
  count: number | null;
}

export async function getVenues({
  filters,
  sort,
  pagination,
  favouriteVenues,
}: VenuesRequestParams): Promise<VenuesResponse> {
  let query = supabase.from('venue_details').select('*', { count: 'exact' });

  // Apply favouriteVenue filter when in user mode
  // Used to display favourtite venues on profile page

  if (favouriteVenues) {
    query = query.in('venue_id', favouriteVenues);
  }

  // Apply each filter in the filters array if any

  if (filters.length > 0) {
    filters.forEach((filter) => {
      const convertedField = decamelize(filter.field);
      query = query[filter.method](convertedField, filter.value);
    });
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
    throw new Error(`Venues could not be loaded. Error:${error.message}`);
  }
  return { data: camelcaseKeys(data), count };
}

export async function getVenue(id: string): Promise<Venue> {
  const { data, error } = await supabase
    .from('venue_details')
    .select('*')
    .eq('venue_id', id);

  if (error) {
    throw new Error(`Venue could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data[0]);
}

export async function getUniqueCities(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_unique_cities');

  if (error) {
    throw new Error(`Cities could not be loaded. Error:${error.message}`);
  }

  return data;
}

export async function createVenue(newVenue: NewVenue) {
  const convertedVenue = decamelizeKeys(newVenue);

  const { data, error } = await supabase
    .from('venue_details')
    .insert(convertedVenue)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Venue could not be created. Error:${error.message}`);
  }
  return camelcaseKeys(data);
}

export async function createUniqueCityApi({ cityObj }) {
  const { city, country } = cityObj;

  // Check if city already exists in unique_cities table.
  const { data: existingCity, error: fetchError } = await supabase
    .from('unique_cities')
    .select('*')
    .eq('city', city)
    .eq('country', country)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching unique cities:${fetchError.message}`);
  }

  // If city already exists return from function.
  // No further action required.
  if (existingCity) return;

  // City not found, insert new city details.
  const { data, error: insertError } = await supabase
    .from('unique_cities')
    .insert(cityObj)
    .single();

  if (insertError) {
    throw new Error(
      `Error adding city to unique_cities table:${insertError.message}`
    );
  }

  return data;
}

export async function createVenueImage({
  venueId,
  reviewId,
  imageFiles,
  city,
  venueNameSlug,
}: ImageUploadParams) {
  // Compress image. Type asserted as function will return File or throw an Error
  const compressedImages = (await compressImage(imageFiles)) as File[];

  // Upload image to supabase bucket
  const imagePaths = await uploadImages(
    compressedImages,
    'venue-images',
    city,
    venueNameSlug
  );
  // Generate alt text for image + full URL
  const newImages = imagePaths.map((imagePath) => ({
    url: `${supabaseUrl}/storage/v1/object/public/venue-images/${imagePath}`,
    alt: `An image of ${venueNameSlug} in ${city}`,
  }));

  // Determine table to store image path based on presence of reviewId
  const tableName = reviewId ? 'venue_reviews' : 'venue_details';
  const rowId = reviewId ? 'review_id' : 'venue_id';
  const idValue = reviewId || venueId;

  // Fetch current images array
  const { data: currentImages, error: fetchError } = await supabase
    .from(tableName)
    .select('images')
    .eq(rowId, idValue)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching current images: ${fetchError.message}`);
  }

  // Append new image objects to existing array
  // Or create new image array if one does not exist
  const updatedImages = currentImages.images
    ? [...currentImages.images, ...newImages]
    : [...newImages];

  const { data, error } = await supabase
    .from(tableName)
    .update({ images: updatedImages })
    .eq(rowId, idValue);

  if (error) {
    throw new Error(`Error adding image to database: ${error.message}`);
  }
  console.log('this is the uploaded image data', data);
  return data;
}
