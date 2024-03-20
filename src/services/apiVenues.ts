// Third Party Imports
import camelcaseKeys from 'camelcase-keys';
import decamelizeKeys from 'decamelize-keys';
import supabase, { supabaseUrl } from './supabase';

// Type Imports
import { ImageUploadParams, NewVenue, Venue } from '../models/venueTypes';

// Util Imports
import compressImage from '../utils/compressImage';
import uploadImages from './supabaseImageUploader';

export async function getVenues(): Promise<Venue[]> {
  const { data, error } = await supabase.from('venue_details').select('*');

  if (error) {
    throw new Error(`Venues could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data);
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

export async function createVenueImage({
  venueId,
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

  // Fetch current images array
  const { data: currentImages, error: fetchError } = await supabase
    .from('venue_details')
    .select('images')
    .eq('venue_id', venueId)
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
    .from('venue_details')
    .update({ images: updatedImages })
    .eq('venue_id', venueId);

  if (error) {
    throw new Error(`Error adding image to database: ${error.message}`);
  }
  console.log('this is the uploaded image data', data);
  return data;
}
