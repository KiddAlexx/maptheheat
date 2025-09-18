import { supabaseUrl } from '@/services/supabase';
import { DetailedImage } from '@/types/venueTypes';

// Function to map over venue images + add path
export function addImagePaths(images?: DetailedImage[] | null) {
  if (!images || images.length === 0) return [];
  return images.map((img) => ({
    ...img,
    imagePath: {
      lg: `${supabaseUrl}/storage/v1/object/public/venue-images/${img.imagePath.lg}`,
      md: `${supabaseUrl}/storage/v1/object/public/venue-images/${img.imagePath.md}`,
      sm: `${supabaseUrl}/storage/v1/object/public/venue-images/${img.imagePath.sm}`,
    },
  }));
}
