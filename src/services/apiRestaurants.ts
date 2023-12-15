import { NewRestaurant } from '../models/restaurantTypes';
import compressImage from '../utils/compressImage';
import supabase, { supabaseUrl } from './supabase';
import uploadImage from './supabaseImageUploader';

export async function getRestaurants() {
  const { data, error } = await supabase.from('restaurant-details').select('*');

  if (error) {
    throw new Error('Restaurants could not be loaded');
  }
  return data;
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

export async function createRestaurantImage(
  restaurantId,
  imgFile,
  city,
  restaurantName
) {
  // Compress image
  const compressedImage = await compressImage(imgFile);

  // Upload image to supabase bucket + return path
  const imagePath = await uploadImage(
    compressedImage,
    'restaurant-images',
    city,
    restaurantName
  );

  const altText = `An image of ${restaurantName} in ${city}`;
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/${imagePath}`;

  const { data, error } = await supabase
    .from('restaurant-details')
    .update([{ images: { alt: altText, url: imageUrl } }])
    .eq('id', restaurantId);

  if (error) {
    throw new Error(`Error adding image to database: ${error.message}`);
  }

  return data;
}
