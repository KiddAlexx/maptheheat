import { Image } from '@heroui/react';
import clsx from 'clsx';
import type { ChangeEvent } from 'react';
import ActionButton from '@/ui/ActionButton';
import { useModalContext } from '@/context/ModalContext';
import type { ModerationImage, ModerationStatus } from '@/types/venueTypes';
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from '../constants';
import { getImageStatusUpdatePayload } from '../utils/imageStatusPayload';

export type ImageDecision = Extract<ModerationStatus, 'approved' | 'declined'>;

interface ImageModerationPanelProps {
  images?: ModerationImage[];
  isUpdating?: boolean;
  onImageDecisionChange: (
    imageId: string,
    decision: ImageDecision,
    isChecked: boolean
  ) => void;
  onUpdateStatuses?: (payload: ImageStatusUpdatePayload) => void;
  selectedStatuses: Record<string, ImageDecision | undefined>;
  description?: string;
  title?: string;
}

export interface ImageStatusUpdatePayload {
  approvedImageIds: string[];
  declinedImageIds: string[];
}

function ImageModerationPanel({
  images = [],
  isUpdating = false,
  onImageDecisionChange,
  onUpdateStatuses,
  selectedStatuses,
  description = 'Select image moderation decisions before updating their statuses.',
  title = 'Attached images',
}: ImageModerationPanelProps) {
  const { openModalImages } = useModalContext();
  const payload = getImageStatusUpdatePayload(selectedStatuses);
  const hasSelectedImages =
    payload.approvedImageIds.length + payload.declinedImageIds.length > 0;

  function handleImageOpen(imageId: string) {
    const clickedImageIndex = images.findIndex(
      (image) => image.imageId === imageId
    );
    const orderedImages =
      clickedImageIndex > -1
        ? [
            ...images.slice(clickedImageIndex),
            ...images.slice(0, clickedImageIndex),
          ]
        : images;

    openModalImages(
      'image-carousel',
      orderedImages.map((image) => ({
        alt: image.altText,
        id: image.imageId,
        url: image.imagePath.lg,
      }))
    );
  }

  function handleUpdateStatuses() {
    if (!onUpdateStatuses) return;

    onUpdateStatuses(payload);
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            {description}
          </p>
        </div>
        {onUpdateStatuses ? (
          <ActionButton
            intent="confirm"
            isDisabled={!hasSelectedImages || isUpdating}
            isLoading={isUpdating}
            onPress={handleUpdateStatuses}
          >
            Update images
          </ActionButton>
        ) : null}
      </div>

      {images.length > 0 ? (
        <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <li
              key={image.imageId}
              className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <figure>
                <ImagePreviewButton
                  image={image}
                  onOpen={handleImageOpen}
                />
                <figcaption className="space-y-4 p-4">
                  <div className="flex flex-col gap-2">
                    <span
                      className={clsx(
                        'w-fit rounded-full border px-2.5 py-1 text-xs font-semibold',
                        STATUS_BADGE_CLASSES[image.status]
                      )}
                    >
                      {STATUS_LABELS[image.status]}
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {image.altText || 'Submitted venue image'}
                    </p>
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="text-xs font-semibold uppercase tracking-normal text-gray-500">
                      Moderation decision
                    </legend>
                    <ImageDecisionCheckbox
                      checked={
                        getSelectedImageDecision(image, selectedStatuses) ===
                        'approved'
                      }
                      imageId={image.imageId}
                      label="Approve image"
                      name={`approve-${image.imageId}`}
                      onChange={onImageDecisionChange}
                      status="approved"
                    />
                    <ImageDecisionCheckbox
                      checked={
                        getSelectedImageDecision(image, selectedStatuses) ===
                        'declined'
                      }
                      imageId={image.imageId}
                      label="Decline image"
                      name={`decline-${image.imageId}`}
                      onChange={onImageDecisionChange}
                      status="declined"
                    />
                  </fieldset>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-zinc-600">
          No images are attached to this submission.
        </p>
      )}
    </section>
  );
}

function ImagePreviewButton({
  image,
  onOpen,
}: {
  image: ModerationImage;
  onOpen: (imageId: string) => void;
}) {
  function handleClick() {
    onOpen(image.imageId);
  }

  return (
    <button
      aria-label={`Open full-size image: ${image.altText}`}
      className="block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      onClick={handleClick}
      type="button"
    >
      <Image
        alt={image.altText}
        className="h-48 w-full object-cover"
        radius="none"
        removeWrapper
        src={image.imagePath.md}
      />
    </button>
  );
}

function getSelectedImageDecision(
  image: ModerationImage,
  selectedStatuses: Record<string, ImageDecision | undefined>
): ImageDecision | undefined {
  return selectedStatuses[image.imageId] ?? getExistingImageDecision(image);
}

function getExistingImageDecision(
  image: ModerationImage
): ImageDecision | undefined {
  return image.status === 'pending' ? undefined : image.status;
}

function ImageDecisionCheckbox({
  checked,
  imageId,
  label,
  name,
  onChange,
  status,
}: {
  checked: boolean;
  imageId: string;
  label: string;
  name: string;
  onChange: (
    imageId: string,
    status: ImageDecision,
    isChecked: boolean
  ) => void;
  status: ImageDecision;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(imageId, status, event.target.checked);
  }

  return (
    <label className="flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800">
      <input
        checked={checked}
        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        name={name}
        onChange={handleChange}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

export default ImageModerationPanel;
