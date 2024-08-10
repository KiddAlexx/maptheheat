import { useState } from 'react';

// Import React FilePond
import { FilePond, registerPlugin } from 'react-filepond';

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { Button } from '@nextui-org/react';
import { useGlobalError } from '@/context/ErrorContext';
import { useUpdateAvatar } from '../hooks/useUpdateAvatar';
import LoaderSpinner from '@/ui/LoaderSpinner';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function UpdateAvatar() {
  //File Upload State
  const [newAvatar, setNewAvatar] = useState<File[]>([]);
  const { setGlobalError } = useGlobalError();
  const { updateAvatar, isUpdating } = useUpdateAvatar();

  function uploadFile() {
    console.log(newAvatar);
    if (newAvatar.length === 0) {
      setGlobalError('No images were selected!');
      return;
    }

    updateAvatar({ newAvatar }, { onSuccess: () => setNewAvatar([]) });
  }

  return (
    <div>
      <FilePond
        files={newAvatar}
        onupdatefiles={(images) => {
          // Update state with new files array
          const newImages = images.map((image) => image.file);
          setNewAvatar(newImages);
        }}
        allowMultiple={false}
        disabled={isUpdating}
        maxFiles={1}
        name="files"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      />
      <h3>Select a suitable avatar to upload</h3>
      <div>
        <Button onClick={uploadFile} isDisabled={isUpdating}>
          {isUpdating ? <LoaderSpinner /> : 'Upload'}
        </Button>
      </div>
    </div>
  );
}

export default UpdateAvatar;
