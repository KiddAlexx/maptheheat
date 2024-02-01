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

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { city, venue } = useParams();

  /*   const { city, id, urlSlug: restaurantName } = activeRestaurant; */

  const { uploadImageRef, isUploading, fileUploaded } =
    useUpdateRestaurantImage();

  // Ensures image upload state is reset if user changes active restaurant
  // Or when image upload has completed sucessfuly
  useEffect(() => {
    setImageFile(null);
  }, [id, fileUploaded]);

  const { isAuthenticated } = useUser();

  // Return from function if activeRestaurant does not exist
  // Handle this with error message in future

  if (!id) {
    return;
  }

  // Function to handle compression and upload of selected image to Supabase storage.
  const uploadFile = async function () {
    if (!imageFile) return;

    if (!isAuthenticated) return navigate('/login');

    console.log('log from image uploader ', id, imageFile, city, venue);
    uploadImageRef({ id, imageFile, city, venue });
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
            {isUploading ? 'Uploading' : 'Upload'}
          </button>
        </>
      )}
    </div>
  );
}

export default ImageUploader;
