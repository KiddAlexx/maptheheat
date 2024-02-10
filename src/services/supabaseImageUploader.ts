import supabase from './supabase';

async function uploadImage(
  imageFile: File,
  bucketName: string,
  ...folders: string[]
) {
  if (!imageFile) {
    throw new Error('No image file provided');
  }

  // Create unique file name
  const imageName = `${Date.now()}-${Math.random().toString(36).substr(2)}`
    .replaceAll('/', '-')
    .replaceAll(' ', '-')
    .toLowerCase();

  // Create storage path
  const folderPath = folders.join('/');
  const imagePath = `${folderPath}/${imageName}`;

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(imagePath, imageFile, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) throw error;
    return imagePath;
  } catch (error) {
    if (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }
}

export default uploadImage;
