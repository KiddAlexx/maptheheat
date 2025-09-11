// Third Party Imports
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';
import decamelize from 'decamelize';
import supabase, { supabaseUrl } from './supabase';

// Type Imports
import {
  ImageUploadParams,
  NewVenue,
  UniqueCity,
  UniqueUserCity,
  Venue,
  VenueFilter,
  VenuePagination,
  VenueSort,
} from '../types/venueTypes';

// Util Imports
import compressImage from '../utils/compressImage';
import uploadImages from './supabaseImageUploader';
import { addImagePaths } from '@/utils/addImagePaths';

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

export interface UniqueCityProps {
  city: string;
  country: string;
}

export async function getVenues({
  filters,
  sort,
  pagination,
  favouriteVenues,
}: VenuesRequestParams): Promise<VenuesResponse> {
  let query = supabase
    .from('venue_details')
    .select('*', { count: 'exact' })
    .eq('status', 'approved');

  // Apply favouriteVenue filter when in user mode
  // Used to display favourtite venues on profile page

  if (favouriteVenues) {
    query = query.in('venue_id', favouriteVenues);
  }

  // Apply each filter in the filters array if any

  if (filters.length > 0) {
    filters.forEach((filter) => {
      const convertedField = decamelize(filter.field);
      // @ts-expect-error: Dynamic method call on Supabase query builder is safe due to controlled filter.method values
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
    .select('*,  venue_images(image_path_large, alt_text)')
    .eq('venue_id', id)
    .eq('status', 'approved')
    .filter('venue_images.status', 'eq', 'approved');

  if (error) {
    throw new Error(`Venue could not be loaded. Error:${error.message}`);
  }

  const venueData = camelcaseKeys(data[0], { deep: true });

  const venue = {
    ...venueData,
    venueImages: addImagePaths(venueData.venueImages),
  };

  return venue;
}

// Uses supabase sql function to fetch unique city list
// for venues in users favourite list
export async function getUserCitiesSupabase(
  favVenueList: string[]
): Promise<UniqueCity[]> {
  const { data, error } = await supabase.rpc('get_unique_cities', {
    venue_ids: favVenueList,
  });

  const citiesWithIds = data.map((cityObj: UniqueUserCity, index: number) => ({
    id: index + 1,
    ...cityObj,
  }));

  if (error) {
    throw new Error(`Cities could not be loaded. Error:${error.message}`);
  }

  return citiesWithIds;
}

export async function getUniqueCities(): Promise<UniqueCity[]> {
  const { data, error } = await supabase
    .from('unique_cities')
    .select('coords, country, city, id')
    .order('city', { ascending: true });

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

export async function createUniqueCityApi(cityObj: UniqueCityProps) {
  const { city, country } = cityObj;

  // Check if city already exists in unique_cities table.
  const { data: existingCity, error: fetchError } = await supabase
    .from('unique_cities')
    .select('*')
    .eq('city', city)
    .eq('country', country)
    .maybeSingle();

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

// Function to check whether user has 6 or more pending images
export async function canUserAddImage() {
  const { data, error } = await supabase.rpc('can_submit_standalone_images');
  if (error) {
    throw new Error(`Error checking image permission. Error: ${error.message}`);
  }
  return data;
}

export async function createVenueImage({
  venueId,
  reviewId,
  imageFiles,
  city,
  venueNameSlug,
  imageType,
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
  // Generate image entry + alt text
  const newImages = imagePaths.map((imagePath) => ({
    image_path_large: imagePath,
    alt_text: `An image of ${venueNameSlug} in ${city}`,
    venue_id: venueId,
    review_id: reviewId,
    image_type: imageType,
  }));

  const { data, error } = await supabase.from('venue_images').insert(newImages);

  // Check if venue already has a thumbnail & add ** Temp while building
  const { data: venueData } = await supabase
    .from('venue_details')
    .select('thumbnail_image')
    .eq('venue_id', venueId)
    .single();

  if (!venueData?.thumbnail_image) {
    const { error: thumbnailError } = await supabase
      .from('venue_details')
      .update({
        thumbnail_image: {
          url: `${supabaseUrl}/storage/v1/object/public/venue-images/${newImages[0].image_path_large}`,
          alt: newImages[0].alt_text,
        },
      })
      .eq('venue_id', venueId);

    if (thumbnailError) {
      throw new Error(
        `Failed to set thumbnail image: ${thumbnailError.message}`
      );
    }
  }

  if (error) {
    throw new Error(`Error adding image to database: ${error.message}`);
  }
  return data;
}
