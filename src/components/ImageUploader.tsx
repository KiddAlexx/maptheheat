// React imports
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

// Third party imports

// Style imports
import styles from './ImageUploader.module.css';

// Hooks imports
import { useUpdateVenueImage } from '../features/venues/hooks/useUpdateVenueImage';
import { useUser } from '../features/authentication/useUser';

// File imports
import cameraIcon from '../assets/icons/camera.svg';
import { useModalContext } from '../context/ModalContext';

function ImageUploader() {
  // Fetch image upload functionality and states from React Query hook
  const { uploadImageRef, isUploading, fileUploaded } = useUpdateVenueImage();
  // Load remaining hooks
  const { isAuthenticated } = useUser();
  const { openModal } = useModalContext();

  //File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load paramater values
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { city, venue } = useParams();

  // Ensures image upload state is reset if user changes active venue
  // Or when image upload has completed sucessfuly
  useEffect(() => {
    if (id) {
      setImageFile(null);
    }
    if (fileUploaded === true) {
      setImageFile(null);
    }
  }, [id, fileUploaded]);

  // Return from function if params do not exist
  if (!id || !city || !venue) return;

  // Function to handle compression and upload of selected image to Supabase storage.
  const uploadFile = async function () {
    if (!imageFile) return;

    if (!isAuthenticated) return;

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
            openModal('login');
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
