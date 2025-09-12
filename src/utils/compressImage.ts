// Third party imports
import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: 'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif';
}

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
