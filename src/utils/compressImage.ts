// Third party imports
import imageCompression from 'browser-image-compression';

export default async function compressImage(img, compressionOptions?) {
  const finalCompressionOptions = compressionOptions || {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 640,
    useWebWorker: true,
  };

  try {
    const compressedImage = await imageCompression(
      img,
      finalCompressionOptions
    );
    return compressedImage;
  } catch (err) {
    throw new Error(`There was an error compressing your image ${err.message}`);
  }
}
