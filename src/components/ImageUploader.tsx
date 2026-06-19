// Third Party Imports
// Import React FilePond
import { FilePond, registerPlugin } from 'react-filepond';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// Hooks
import { useGlobalError } from '@/context/ErrorContext';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useModalContext } from '@/context/ModalContext';
import { useUpdateVenueImage } from '@/features/venues/hooks/useUpdateVenueImage';
import { useUser } from '@/features/authentication/hooks/useUser';

// Components
import LoaderSpinner from '@/ui/LoaderSpinner';
import ActionButton from '@/ui/ActionButton';

// Type imports
import type { Venue } from '@/types/venueTypes';

// Types
interface ImageUploaderProps {
  venue?: Venue;
  maxPhotos?: number;
  mode?: 'modal' | 'integrated';
  reviewId?: string;
  imageType: 'venue' | 'review' | 'standalone';
}

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

function ImageUploader({
  venue,
  maxPhotos = 6,
  mode,
  reviewId,
  imageType,
}: ImageUploaderProps) {
  // Fetch image upload functionality and states from React Query hook
  const { uploadImageRef, isUploading } = useUpdateVenueImage();

  // Load remaining hooks
  const { isAuthenticated } = useUser();

  // Fetch venue details from ModalContext
  const {
    venueNameSlug: modalVenueNameSlug,
    city: modalCity,
    venueId: modalVenueId,
    openModal,
    closeModal,
  } = useModalContext();

  // Fetch venue details from props if provided
  const {
    venueNameSlug: propVenueNameSlug,
    city: propCity,
    venueId: propVenueId,
  } = venue ?? {};

  // Assign values based on whether venue provided as props or via ModalContext
  const venueNameSlug = propVenueNameSlug ?? modalVenueNameSlug;
  const city = propCity ?? modalCity;
  const venueId = propVenueId ?? modalVenueId;

  const isModal = mode === 'modal';
  const isIntegrated = mode === 'integrated';

  const navigate = useNavigate();
  const { setGlobalError } = useGlobalError();

  //File Upload State
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Confirmation that the user owns / has the right to upload the selected images
  const [confirmedRights, setConfirmedRights] = useState(false);
  const [rightsError, setRightsError] = useState(false);

  // Function to handle compression and upload of selected image to Supabase storage.
  async function uploadFile() {
    if (imageFiles.length === 0) {
      setGlobalError('No images were selected!');
      return;
    }

    if (!confirmedRights) {
      setRightsError(true);
      return;
    }

    if (!isAuthenticated) return openModal('login');

    uploadImageRef(
      { venueId, reviewId, imageFiles, city, venueNameSlug, imageType },
      {
        onSuccess: () => {
          handleClose();
        },
        onError: (error) => {
          setGlobalError(error.message);
        },
      }
    );
  }

  function handleClose() {
    if (isModal) {
      closeModal();
    }
    if (isIntegrated) {
      navigate('/profile/notifications', {
        replace: true,
      });
    }
  }

  return (
    <div className={`${isModal && 'w-[min(37.5rem,80vw)]'} w-full `}>
      {isUploading ? (
        <LoaderSpinner message="Images currently uploading" />
      ) : (
        <div className={isModal ? 'filepond-modal-constrain' : ''}>
          <FilePond
            files={imageFiles}
            onupdatefiles={(images) => {
              const newImages = images.map((image) => image.file as File);
              setImageFiles(newImages);
            }}
            allowMultiple={true}
            maxFiles={maxPhotos}
            name="files"
            labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            id="firstElementToFocus"
            imagePreviewHeight={isModal ? 96 : 130}
          />
        </div>
      )}
      {isUploading ? (
        <span>Compression & Upload in progress. Won't be too long!</span>
      ) : (
        <p className="mb-2">Add up to a maximum of {maxPhotos} photos</p>
      )}

      {!isUploading && (
        <div className="mb-3">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="confirm-image-rights"
              checked={confirmedRights}
              aria-describedby={rightsError ? 'image-rights-error' : undefined}
              onChange={(event) => {
                setConfirmedRights(event.target.checked);
                if (event.target.checked) setRightsError(false);
              }}
              className="mt-0.5"
            />
            <label
              htmlFor="confirm-image-rights"
              className="text-xs text-app-muted"
            >
              These are my own photos, or I have permission to use them. They're
              not copied from other websites or listings such as Google. See our{' '}
              <a
                href="/terms"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
              .
            </label>
          </div>
          {rightsError && !confirmedRights && (
            <p
              id="image-rights-error"
              role="alert"
              className="mt-1 text-xs text-danger"
            >
              Please confirm you own or have permission to use these images.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-1">
        <ActionButton
          intent="cancel"
          onPress={handleClose}
          isDisabled={isUploading}
          aria-labelledby="cancel-accName"
        >
          <span id="cancel-accName" hidden>
            Cancel upload
          </span>
          Not right now
        </ActionButton>
        <ActionButton
          intent="confirm"
          onPress={uploadFile}
          isDisabled={isUploading}
          aria-labelledby="upload-accName"
        >
          <span id="upload-accName" hidden>
            Upload Images
          </span>
          Upload
        </ActionButton>
      </div>
    </div>
  );
}

export default ImageUploader;
