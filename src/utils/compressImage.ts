// Third party imports
import imageCompression from 'browser-image-compression';

export default async function compressImage(
  imageFiles: File[],
  compressionOptions?: object
) {
  const finalCompressionOptions = compressionOptions || {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 640,
    useWebWorker: true,
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
