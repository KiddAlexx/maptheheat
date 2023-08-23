import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { storage } from '../config/firebase-config';
import { useRestaurants } from '../context/RestaurantContext';
import imageCompression from 'browser-image-compression';
import styles from './ImageUploader.module.css';

import cameraIcon from '../assets/icons/camera.svg';

function ImageUploader() {
  //File Upload State
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<string>('Upload!');

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
      setUploadState('compressing');
      await uploadBytes(filesFolderRef, compressedImage);
      const downloadURL = await getDownloadURL(filesFolderRef);
      setUploadState('uploading');
      await updateRestaurantImages(id, downloadURL);
      setUploadState('Image uploaded'); //Temp until add visual confirmation of stages
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setUploadState('Upload!');
        setImageUpload(null);
      }, 2000);
    }
  };
  return (
    <div className={styles.imgUploaderContainer}>
      <label className={styles.imgUploaderLabel} htmlFor="imgUploader">
        <img src={cameraIcon} alt="icon of a camera" />{' '}
        {!imageUpload ? 'Add Photo' : 'Change Photo'}
      </label>

      <input
        className={styles.imgUploaderInput}
        type="file"
        id="imgUploader"
        // Checks to ensure e.target.files exists and if not uses null as value
        onChange={(e) => setImageUpload(e.target.files?.[0] ?? null)}
      />

      {imageUpload && (
        <>
          <p>{imageUpload.name} ready to </p>
          <button className={styles.btnImgUploader} onClick={uploadFile}>
            {uploadState}
          </button>
        </>
      )}
    </div>
  );
}

export default ImageUploader;
