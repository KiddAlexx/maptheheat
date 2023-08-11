import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { storage } from '../config/firebase-config';
import { useRestaurants } from '../context/RestaurantContext';

function ImageUploader() {
  //File Upload State
  const [imageUpload, setImageUpload] = useState(null);

  const { activeRestaurant, updateRestaurantImages } = useRestaurants();
  const { city, id, urlSlug: restaurantName } = activeRestaurant;

  const uploadFile = async function () {
    if (!imageUpload) return;
    const filesFolderRef = ref(
      storage,
      `restaurantImages/${city}/${restaurantName}/${imageUpload.name}`
    );
    try {
      await uploadBytes(filesFolderRef, imageUpload);
      const downloadURL = await getDownloadURL(filesFolderRef);
      await updateRestaurantImages(id, downloadURL);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      <div>
        <input
          type="file"
          onChange={(e) => setImageUpload(e.target.files[0])}
        />
        <button onClick={uploadFile}>Upload File</button>
      </div>
    </div>
  );
}

export default ImageUploader;
