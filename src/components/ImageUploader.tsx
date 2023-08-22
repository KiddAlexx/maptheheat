import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { storage } from '../config/firebase-config';
import { useRestaurants } from '../context/RestaurantContext';
import imageCompression from 'browser-image-compression';

function ImageUploader() {
  //File Upload State
  const [imageUpload, setImageUpload] = useState<File | null>(null);

  const { activeRestaurant, updateRestaurantImages } = useRestaurants();

  // Return from function if activeRestaurant does not exist
  // Handle this with error message in future
  if (!activeRestaurant) {
    return;
  }

  const { city, id, urlSlug: restaurantName } = activeRestaurant;

  const uploadFile = async function () {
    if (!imageUpload) return;

    const filesFolderRef = ref(
      storage,
      `restaurantImages/${city}/${restaurantName}/${imageUpload.name}`
    );

    const compressionOptions = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedImage = await imageCompression(
        imageUpload,
        compressionOptions
      );
      console.log('image compressed');
      await uploadBytes(filesFolderRef, compressedImage);
      console.log('image uploaded');
      const downloadURL = await getDownloadURL(filesFolderRef);
      console.log('image url retrieved');
      await updateRestaurantImages(id, downloadURL);
      console.log('Image compressed and uploaded'); //Temp until add visual confirmation of stages
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      <div>
        <input
          type="file"
          // Checks to ensure e.target.files exists and if not uses null as value
          onChange={(e) => setImageUpload(e.target.files?.[0] ?? null)}
        />
        <button onClick={uploadFile}>Upload File</button>
      </div>
    </div>
  );
}

export default ImageUploader;
