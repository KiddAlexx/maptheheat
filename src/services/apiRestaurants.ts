import { ImageUploadParams, NewRestaurant } from '../models/restaurantTypes';
import compressImage from '../utils/compressImage';
import supabase, { supabaseUrl } from './supabase';
import uploadImage from './supabaseImageUploader';

export async function getRestaurants() {
  const { data, error } = await supabase.from('restaurant-details').select('*');

  if (error) {
    throw new Error(`Restaurants could not be loaded. Error:${error.message}`);
  }
  return data;
}

export async function getRestaurant(id: string) {
  const { data, error } = await supabase
    .from('restaurant-details')
    .select('*')
    .eq('id', id);

  if (error) {
    throw new Error(`Restaurant could not be loaded. Error:${error.message}`);
  }
  return data[0];
}

export async function createRestaurant(newRestaurant: NewRestaurant) {
  console.log('Creating restaurant with data:', newRestaurant);
  const { data, error } = await supabase
    .from('restaurant-details')
    .insert(newRestaurant)
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
  // Compress image
  const compressedImage = await compressImage(imageFile);

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
    .from('restaurant-details')
    .select('images')
    .eq('id', id)
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
    .from('restaurant-details')
    .update({ images: updatedImages })
    .eq('id', id);

  if (error) {
    throw new Error(`Error adding image to database: ${error.message}`);
  }
  console.log('this is the uploaded image data', data);
  return data;
}
