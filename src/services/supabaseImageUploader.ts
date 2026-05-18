import slugify from 'slugify';
import { ImageBundle } from '@/utils/compressImage';
import supabase from './supabase';

// Function to upload individual image to supabase bucket
async function imageUploader(path: string, file: File, bucket: string) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return path;
}

// Function to create folder paths & upload individual images
// Returns array of image paths
export async function uploadImages(
  imageFiles: File[],
  bucketName: string,
  ...folders: string[]
) {
  if (!imageFiles?.length) {
    throw new Error('No image files provided');
  }

  // Slugify each folder segment to strip accents and special characters
  // that Supabase storage rejects (e.g. "Horta-Guinardó" → "horta-guinardo")
  const folderPath = folders.map(f => slugify(f, { lower: true })).join('/');

  const imagePaths = imageFiles.map(async (imageFile) => {
    // Create unique file name
    const imageName = crypto.randomUUID();

    const imagePath = `${folderPath}/${imageName}`;

    // Upload each image
    return imageUploader(imagePath, imageFile, bucketName);
  });

  return Promise.all(imagePaths);
}

// Function to create folder paths & upload sm/md/lg image variants
// Returns array of objects, each containing 3 image paths
export async function uploadImageBundle(
  imageFiles: ImageBundle[],
  bucketName: string,
  ...folders: string[]
) {
  if (!imageFiles?.length) {
    throw new Error('No image files provided');
  }
  // Slugify each folder segment to strip accents and special characters
  // that Supabase storage rejects (e.g. "Horta-Guinardó" → "horta-guinardo")
  const folderPath = folders.map(f => slugify(f, { lower: true })).join('/');

  const imagePaths = imageFiles.map(async (imageFile) => {
    // Create image names + full path
    const imageBase = crypto.randomUUID();

    const imageNameLg = `${imageBase}-lg.webp`;
    const imageNameMd = `${imageBase}-md.webp`;
    const imageNameSm = `${imageBase}-sm.webp`;

    const imagePathLg = `${folderPath}/${imageNameLg}`;
    const imagePathMd = `${folderPath}/${imageNameMd}`;
    const imagePathSm = `${folderPath}/${imageNameSm}`;

    // Upload 3 variants in parallel

    const [lgImage, mdImage, smImage] = await Promise.all([
      imageUploader(imagePathLg, imageFile.variants.lg, bucketName),
      imageUploader(imagePathMd, imageFile.variants.md, bucketName),
      imageUploader(imagePathSm, imageFile.variants.sm, bucketName),
    ]);

    return { lg: lgImage, md: mdImage, sm: smImage };
  });

  return Promise.all(imagePaths);
}
