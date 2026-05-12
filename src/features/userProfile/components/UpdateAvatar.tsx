// Third Party Imports
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

// React imports
import { useRef, useState } from 'react';

// Hooks
import { useGlobalError } from '@/context/ErrorContext';
import { useUpdateAvatar } from '../hooks/useUpdateAvatar';

// Utils
import { getCroppedImage } from '../utils/cropImage';

// Components
import ActionButton from '@/ui/ActionButton';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { Icon } from '@iconify/react/dist/iconify.js';

function UpdateAvatar() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaRef = useRef<Area | null>(null);

  const { setGlobalError } = useGlobalError();
  const { updateAvatar, isUpdating } = useUpdateAvatar();

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleCancel() {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    croppedAreaRef.current = null;
  }

  async function handleUpload() {
    if (!imageSrc || !croppedAreaRef.current) return;
    try {
      const file = await getCroppedImage(imageSrc, croppedAreaRef.current);
      updateAvatar(
        { newAvatar: [file] },
        { onSuccess: handleCancel, onError: (err) => setGlobalError(err.message) }
      );
    } catch {
      setGlobalError('Failed to process image. Please try again.');
    }
  }

  if (!imageSrc) {
    return (
      <div className="flex flex-col items-center gap-3">
        <label
          htmlFor="avatar-upload"
          className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-app-border bg-app-surface text-app-muted transition-colors hover:border-primary-400 hover:text-primary-400"
          aria-label="Upload new avatar"
        >
          <Icon icon="lucide:camera" width={28} />
          <span className="mt-1 text-xs">Upload photo</span>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onFileChange}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Crop area */}
      <div className="relative h-64 w-full overflow-hidden rounded-lg bg-zinc-900">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, areaPx) => {
            croppedAreaRef.current = areaPx;
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3">
        <Icon icon="lucide:zoom-out" width={16} className="text-app-muted" />
        <input
          type="range"
          aria-label="Zoom"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-primary-400"
        />
        <Icon icon="lucide:zoom-in" width={16} className="text-app-muted" />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {isUpdating ? (
          <LoaderSpinner message="Uploading avatar" />
        ) : (
          <>
            <ActionButton intent="cancel" onPress={handleCancel}>
              Cancel
            </ActionButton>
            <ActionButton intent="confirm" onPress={handleUpload}>
              Save Avatar
            </ActionButton>
          </>
        )}
      </div>
    </div>
  );
}

export default UpdateAvatar;
