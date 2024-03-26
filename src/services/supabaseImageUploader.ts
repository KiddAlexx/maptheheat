import supabase from './supabase';

async function uploadImages(
  imageFiles: File[],
  bucketName: string,
  ...folders: string[]
) {
  if (!imageFiles) {
    throw new Error('No image files provided');
  }

  // Create storage path
  const folderPath = folders.join('/');

  const imagePaths = imageFiles.map(async (imageFile) => {
    // Create unique file name
    const imageName = `${Date.now()}-${Math.random().toString(36).substring(2)}`
      .replaceAll('/', '-')
      .replaceAll(' ', '-')
      .toLowerCase();

    const imagePath = `${folderPath}/${imageName}`;

    try {
      // Upload each image
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
        console.log(error);
        throw new Error(`Error uploading image: ${error.message}`);
      }
    }
  });

  return Promise.all(imagePaths);
}

export default uploadImages;
