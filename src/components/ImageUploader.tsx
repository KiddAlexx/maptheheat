// React imports
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';

// Third party imports

// Style imports
import styles from './ImageUploader.module.css';

// Hooks imports

import { useUpdateRestaurantImage } from '../features/venues/restaurants/useUpdateRestaurantImage';

// File imports
import cameraIcon from '../assets/icons/camera.svg';
import { useUser } from '../features/authentication/useUser';

function ImageUploader() {
  //File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<string>('Upload!');

  const navigate = useNavigate();

  const [searchParams, setSearchParam] = useSearchParams();
  const id = searchParams.get('id');
  const { city, venue } = useParams();

  // Ensures image upload state is reset if user changes active restaurant
  useEffect(() => {
    setImageFile(null);
    setUploadState('Upload!');
  }, [id]);

  // Return from function if activeRestaurant does not exist
  // Handle this with error message in future

  if (!id) {
    return;
  }

  /*   const { city, id, urlSlug: restaurantName } = activeRestaurant; */

  const { uploadImageRef, isUploading } = useUpdateRestaurantImage();

  const { isAuthenticated } = useUser();

  // Function to handle compression and upload of selected image to Supabase storage.
  const uploadFile = async function () {
    if (!imageFile) return;

    if (!isAuthenticated) return navigate('/login');

    const compressionOptions = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 960,
      useWebWorker: true,
    };

    try {
      console.log('log from image uploader ', id, imageFile, city, venue);
      uploadImageRef({ id, imageFile, city, venue });

      setUploadState('Image uploaded');
    } catch (err) {
      console.error(err); // Handle error!
    } finally {
      setTimeout(() => {
        setUploadState('Upload!');
        setImageFile(null);
      }, 2000);
    }
  };
  return (
    <div className={styles.imgUploaderContainer}>
      <label
        className={styles.imgUploaderLabel}
        htmlFor="imgUploader"
        onClick={(e) => {
          if (!isAuthenticated) {
            e.preventDefault();
            navigate('/login');
          }
        }}
      >
        <img src={cameraIcon} alt="icon of a camera" />
        {!imageFile ? 'Add Photo' : 'Change Photo'}
      </label>

      <input
        className={styles.imgUploaderInput}
        type="file"
        id="imgUploader"
        // Checks to ensure e.target.files exists and if not uses null as value
        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
      />

      {imageFile && (
        <>
          <p>{imageFile.name} ready to </p>
          <button className={styles.btnImgUploader} onClick={uploadFile}>
            {uploadState}
          </button>
        </>
      )}
    </div>
  );
}

export default ImageUploader;
