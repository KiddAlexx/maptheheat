// Third Party Imports
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';
import decamelize from 'decamelize';
import supabase from './supabase';

// Type Imports
import {
  Coords,
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
import { compressImageVariants } from '../utils/compressImage';
import { uploadImageBundle } from './supabaseImageUploader';
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
  coords: Coords;
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
      // Array values (multi-select tag filters) are passed directly — Supabase JS client handles serialisation
      const value = filter.value;
      // @ts-expect-error: Dynamic method call on Supabase query builder is safe due to controlled filter.method values
      query = query[filter.method](convertedField, value);
    });
  }

  // Apply sort value + direction
  if (sort) {
    const convertedSortField = decamelize(sort.field);
    query = query.order(convertedSortField, {
      ascending: sort.direction === 'asc',
      // Unrated venues (NULL rating/review columns) always sink to the bottom,
      // otherwise Postgres places NULLs first on a DESC sort
      nullsFirst: false,
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
    .select('*, profiles(username), venue_images(image_path, alt_text, image_id)')
    .eq('venue_id', id)
    .eq('status', 'approved')
    .filter('venue_images.status', 'eq', 'approved');

  if (error) {
    throw new Error(`Venue could not be loaded. Error:${error.message}`);
  }

  const venueData = camelcaseKeys(data[0], { deep: true });
  const { profiles, ...venueFields } = venueData;

  const venue = {
    ...venueFields,
    venueImages: addImagePaths(venueData.venueImages),
    addedByUsername: profiles?.username ?? null,
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
    cityId: index + 1,
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
    .select('coords, country, city, city_id')
    .order('city', { ascending: true });

  if (error) {
    throw new Error(`Cities could not be loaded. Error:${error.message}`);
  }

  return camelcaseKeys(data);
}

// Function to check whether user has 2 or more pending venues
export async function canUserAddVenue() {
  const { data, error } = await supabase.rpc('can_submit_venue');
  if (error) {
    throw new Error(`Error checking venue permission. Error: ${error.message}`);
  }
  return data;
}

export async function createVenueApi(newVenue: NewVenue) {
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
  const { city, country, coords } = cityObj;

  const { data, error } = await supabase.rpc('upsert_unique_city', {
    p_city: city,
    p_country: country,
    p_coords: coords,
  });

  if (error) {
    throw new Error(`Error creating unique city. Error:${error.message}`);
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
  // Compress images sm/md/lg variants
  const compressedVariants = await compressImageVariants(imageFiles);

  // Upload image variants
  const variantPaths = await uploadImageBundle(
    compressedVariants,
    'venue-images',
    city,
    venueNameSlug
  );

  // Generate image entry + alt text
  const newImages = variantPaths.map((imagePath) => ({
    image_path: { lg: imagePath.lg, md: imagePath.md, sm: imagePath.sm },
    alt_text: `An image of ${venueNameSlug} in ${city}`,
    venue_id: venueId,
    review_id: reviewId,
    image_type: imageType,
  }));

  const { data, error } = await supabase.from('venue_images').insert(newImages);

  // Check if venue already has a thumbnail & add ** Temp while building
  /*   const { data: venueData } = await supabase
    .from('venue_details')
    .select('thumbnail_image')
    .eq('venue_id', venueId)
    .single();


  if (!venueData?.thumbnail_image) {
    const { error: thumbnailError } = await supabase
      .from('venue_details')
      .update({
        thumbnail_image: {
          url: `${supabaseUrl}/storage/v1/object/public/venue-images/${newImages[0].image_path.sm}`,
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
 */
  if (error) {
    throw new Error(`Error adding image to database: ${error.message}`);
  }
  return data;
}
