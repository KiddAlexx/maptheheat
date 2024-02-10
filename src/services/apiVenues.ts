import camelcaseKeys from 'camelcase-keys';
import { ImageUploadParams, NewVenue } from '../models/venueTypes';
import compressImage from '../utils/compressImage';
import supabase, { supabaseUrl } from './supabase';
import uploadImage from './supabaseImageUploader';
import decamelizeKeys from 'decamelize-keys';

export async function getVenues() {
  const { data, error } = await supabase.from('venue_details').select('*');

  if (error) {
    throw new Error(`Venues could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data);
}

export async function getVenue(id: string) {
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
  return data;
}

export async function createVenueImage({
  id,
  imageFile,
  city,
  venue,
}: ImageUploadParams) {
  // Compress image. Type asserted as function will return File or throw an Error
  const compressedImage = (await compressImage(imageFile)) as File;

  // Upload image to supabase bucket
  const imagePath = await uploadImage(
    compressedImage,
    'venue-images',
    city,
    venue
  );
  // Generate alt text for image + full URL
  const altText = `An image of ${venue} in ${city}`;
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/venue-images/${imagePath}`;

  // Fetch current images array
  const { data: currentImages, error: fetchError } = await supabase
    .from('venue_details')
    .select('images')
    .eq('venue_id', id)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching current images: ${fetchError.message}`);
  }

  // Append new image object to existing array
  // Or create new image array if one does not exist
  const updatedImages = currentImages.images
    ? [...currentImages.images, { alt: altText, url: imageUrl }]
    : [{ alt: altText, url: imageUrl }];

  const { data, error } = await supabase
    .from('venue_details')
    .update({ images: updatedImages })
    .eq('venue_id', id);

  if (error) {
    throw new Error(`Error adding image to database: ${error.message}`);
  }
  console.log('this is the uploaded image data', data);
  return data;
}
