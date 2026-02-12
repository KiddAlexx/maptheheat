// Third Party Imports
import { FilePond, registerPlugin } from 'react-filepond';

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// React imports
import { useState } from 'react';

// Hooks
import { useGlobalError } from '@/context/ErrorContext';
import { useUpdateAvatar } from '../hooks/useUpdateAvatar';

// Components
import { Button } from '@heroui/react';
import LoaderSpinner from '@/ui/LoaderSpinner';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function UpdateAvatar() {
  //File Upload State
  const [newAvatar, setNewAvatar] = useState<File[]>([]);
  const { setGlobalError } = useGlobalError();
  const { updateAvatar, isUpdating } = useUpdateAvatar();

  function uploadFile() {
    if (newAvatar.length === 0) {
      setGlobalError('No images were selected!');
      return;
    }

    updateAvatar(
      { newAvatar },
      {
        onSuccess: () => setNewAvatar([]),
        onError: (error) => setGlobalError(error.message),
      }
    );
  }

  return (
    <div>
      <FilePond
        files={newAvatar}
        onupdatefiles={(images) => {
          // Update state with new files array
          const newImages = images
            .map((image) => image.file)
            // Filter out non-File entries and ensure TypeScript treats all items as File objects
            .filter((file): file is File => file instanceof File);
          setNewAvatar(newImages);
        }}
        allowMultiple={false}
        disabled={isUpdating}
        maxFiles={1}
        name="files"
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
      />
      <h3>Select a suitable avatar to upload</h3>
      <div className="mt-2 flex justify-end">
        <Button
          className="bg-success-400"
          radius="sm"
          size="md"
          onPress={uploadFile}
          isDisabled={isUpdating}
        >
          {isUpdating ? <LoaderSpinner message="Uploading avatar" /> : 'Upload'}
        </Button>
      </div>
    </div>
  );
}

export default UpdateAvatar;
