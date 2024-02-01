// Third party imports
import imageCompression from 'browser-image-compression';

export default async function compressImage(
  imageFile: File,
  compressionOptions?: object
) {
  const finalCompressionOptions = compressionOptions || {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 640,
    useWebWorker: true,
  };

  try {
    console.log(imageFile);
    const compressedImage = await imageCompression(
      imageFile,
      finalCompressionOptions
    );
    return compressedImage;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(
        `There was an error compressing your image ${err.message}`
      );
    }
  }
}
