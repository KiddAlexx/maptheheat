// Import React FilePond
import { FilePond, registerPlugin } from 'react-filepond';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';

// Style imports
import styles from './ImageUploader.module.css';

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { useState } from 'react';
import { useModalContext } from '@/context/ModalContext';
import { useUpdateVenueImage } from '@/features/venues/hooks/useUpdateVenueImage';
import { useUser } from '@/features/authentication/hooks/useUser';
import { Button } from "@heroui/button";
import { useGlobalError } from '@/context/ErrorContext';
import { useNavigate } from 'react-router';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function ImageUploader({ venue, maxPhotos = 6, mode, reviewId }) {
  // Fetch image upload functionality and states from React Query hook
  const { uploadImageRef, isUploading, fileUploaded } = useUpdateVenueImage();

  // Load remaining hooks
  const { isAuthenticated } = useUser();

  const {
    venueNameSlug: modalVenueNameSlug,
    city: modalCity,
    venueId: modalVenueId,
    openModal,
    closeModal,
  } = useModalContext();

  const {
    venueNameSlug: propVenueNameSlug,
    city: propCity,
    venueId: propVenueId,
  } = venue ?? {};

  const venueNameSlug = propVenueNameSlug ?? modalVenueNameSlug;
  const city = propCity ?? modalCity;
  const venueId = propVenueId ?? modalVenueId;

  const isModal = mode === 'modal';
  const isIntegrated = mode === 'integrated';

  const navigate = useNavigate();

  //File Upload State
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const { setGlobalError } = useGlobalError();

  // Function to handle compression and upload of selected image to Supabase storage.
  async function uploadFile() {
    if (imageFiles.length === 0) {
      setGlobalError('No images were selected!');
      return;
    }

    // **** Add error message here too ****
    if (!isAuthenticated) return openModal('login');

    console.log(
      'log from image uploader ',
      venueId,
      reviewId,
      imageFiles,
      city,
      venueNameSlug
    );

    uploadImageRef(
      { venueId, reviewId, imageFiles, city, venueNameSlug },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  function handleClose() {
    if (isModal) {
      closeModal();
    }
    if (isIntegrated) {
      navigate(`/app/venue/${city}/${venueNameSlug}/${venueId}`, {
        replace: true,
      });
    }
  }

  return (
    <>
      <div className={styles.uploadContainer}>
        <FilePond
          files={imageFiles}
          onupdatefiles={(images) => {
            // Update state with new files array
            const newImages = images.map((image) => image.file);
            setImageFiles(newImages);
          }}
          allowMultiple={true}
          maxFiles={maxPhotos}
          name="files"
          labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        />
        <h3>Add up to a maximum on {maxPhotos} photos</h3>
        <div className={styles.buttonContainer}>
          <Button onClick={handleClose}>Not right now</Button>
          <Button id="firstElementToFocus" onClick={uploadFile}>
            Upload
          </Button>
        </div>
      </div>
    </>
  );
}

export default ImageUploader;
