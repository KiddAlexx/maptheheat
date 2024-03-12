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

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function ImageUploader() {
  const [files, setFiles] = useState<File[]>([]);

  const { venueName, city, venueId } = useModalContext();

  return (
    <div className={styles.uploadContainer}>
      <FilePond
        files={files}
        onupdatefiles={(fileItems) => {
          // Update state with new files array
          const newFiles = fileItems.map((fileItem) => fileItem.file);
          setFiles(newFiles);
        }}
        allowMultiple={true}
        maxFiles={5}
        name="files"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      />
      <div>{venueName}</div>
      <div>{venueId}</div>
      <div>{city}</div>
      <button id="firstElementToFocus" onClick={() => console.log(files)}>
        Log
      </button>
    </div>
  );
}

export default ImageUploader;
