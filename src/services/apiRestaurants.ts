import camelcaseKeys from 'camelcase-keys';
import { ImageUploadParams, NewRestaurant } from '../models/restaurantTypes';
import compressImage from '../utils/compressImage';
import supabase, { supabaseUrl } from './supabase';
import uploadImage from './supabaseImageUploader';
import decamelizeKeys from 'decamelize-keys';

export async function getRestaurants() {
  const { data, error } = await supabase.from('restaurant_details').select('*');

  if (error) {
    throw new Error(`Restaurants could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data);
}

export async function getRestaurant(id: string) {
  const { data, error } = await supabase
    .from('restaurant_details')
    .select('*')
    .eq('restaurant_id', id);

  if (error) {
    throw new Error(`Restaurant could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data[0]);
}

export async function createRestaurant(newRestaurant: NewRestaurant) {
  const convertedRestaurant = decamelizeKeys(newRestaurant);
  const { data, error } = await supabase
    .from('restaurant_details')
    .insert(convertedRestaurant)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Restaurant could not be created. Error:${error.message}`);
  }
  return data;
}

export async function createRestaurantImage({
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
    'restaurant-images',
    city,
    venue
  );
  // Generate alt text for image + full URL
  const altText = `An image of ${venue} in ${city}`;
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/restaurant-images/${imagePath}`;

  // Fetch current images array
  const { data: currentImages, error: fetchError } = await supabase
    .from('restaurant_details')
    .select('images')
    .eq('restaurant_id', id)
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
    .from('restaurant_details')
    .update({ images: updatedImages })
    .eq('restaurant_id', id);

  if (error) {
    throw new Error(`Error adding image to database: ${error.message}`);
  }
  console.log('this is the uploaded image data', data);
  return data;
}
