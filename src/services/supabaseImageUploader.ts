import supabase from './supabase';

async function uploadImage(imageFile, bucketName, folder, subFolder) {
  if (!imageFile) {
    throw new Error('No image file provided');
  }

  // Create file name
  const imageName = `${Math.random()}-${imageFile.name}`
    .replaceAll('/', '-')
    .replaceAll(' ', '-')
    .toLowerCase();

  // Create storage path
  const imagePath = `${bucketName}/${folder}/${subFolder}/${imageName}`;

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(imagePath, imageFile, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) throw error;
    return imagePath;
  } catch (err) {
    throw new Error(`Error uploading image: ${err.message}`);
  }
}

export default uploadImage;
