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
import { useUser } from '@/features/authentication/useUser';
import { Button } from '@nextui-org/button';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function ImageUploader() {
  // Fetch image upload functionality and states from React Query hook
  const { uploadImageRef, isUploading, fileUploaded } = useUpdateVenueImage();

  // Load remaining hooks
  const { isAuthenticated } = useUser();
  const { venueNameSlug, city, venueId, openModal } = useModalContext();

  //File Upload State
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Function to handle compression and upload of selected image to Supabase storage.
  const uploadFile = async function () {
    if (!imageFiles) return;

    // **** Add error message here too ****
    if (!isAuthenticated) return openModal('login');

    console.log(
      'log from image uploader ',
      venueId,
      imageFiles,
      city,
      venueNameSlug
    );

    uploadImageRef({ venueId, imageFiles, city, venueNameSlug });
  };

  return (
    <div className={styles.uploadContainer}>
      <FilePond
        files={imageFiles}
        onupdatefiles={(images) => {
          // Update state with new files array
          const newImages = images.map((image) => image.file);
          setImageFiles(newImages);
        }}
        allowMultiple={true}
        maxFiles={5}
        name="files"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      />

      <Button id="firstElementToFocus" onClick={uploadFile}>
        Upload
      </Button>
    </div>
  );
}

export default ImageUploader;
