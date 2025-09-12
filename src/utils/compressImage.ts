// Third party imports
import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: 'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif';
}

// Function to compress image/s with one compression setting
export async function compressImage(
  imageFiles: File[],
  compressionOptions?: CompressionOptions
) {
  const finalCompressionOptions = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 640,
    useWebWorker: true,
    fileType: 'image/webp',
    ...compressionOptions,
  };

  const compressedImages: File[] = [];

  for (const imageFile of imageFiles) {
    try {
      const compressedImage = await imageCompression(
        imageFile,
        finalCompressionOptions
      );
      compressedImages.push(compressedImage);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `There was an error compressing your image ${err.message}`
        );
      }
    }
  }
  return compressedImages;
}

// Function to compress image/s with multiple compression options

const largeCompressionOptions = {
  maxWidthOrHeight: 2400,
  maxSizeMB: 1.2,
  fileType: 'image/webp',
  useWebWorker: true,
};
const mediumCompressionOptions = {
  maxWidthOrHeight: 1280,
  maxSizeMB: 0.5,
  fileType: 'image/webp',
  useWebWorker: true,
};
const smallCompressionOptions = {
  maxWidthOrHeight: 400,
  maxSizeMB: 0.08,
  fileType: 'image/webp',
  useWebWorker: true,
};

export async function compressImageVariants(imageFiles: File[]) {
  const compressedImageBundle = [];
  for (const imageFile of imageFiles) {
    try {
      const [lg, md, sm] = await Promise.all([
        imageCompression(imageFile, largeCompressionOptions),
        imageCompression(imageFile, mediumCompressionOptions),
        imageCompression(imageFile, smallCompressionOptions),
      ]);
      compressedImageBundle.push({ variants: { lg, md, sm } });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          `There was an error compressing your image ${err.message}`
        );
      }
    }
  }
  return compressedImageBundle;
}
