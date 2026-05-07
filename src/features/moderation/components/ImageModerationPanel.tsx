import { Image } from '@heroui/react';
import clsx from 'clsx';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import ActionButton from '@/ui/ActionButton';
import type { ModerationImage, ModerationStatus } from '@/types/venueTypes';

const STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
};

const STATUS_BADGE_CLASSES: Record<ModerationStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-success-200 bg-success-50 text-success-700',
  declined: 'border-danger-200 bg-danger-50 text-danger-700',
};

type ImageDecision = Extract<ModerationStatus, 'approved' | 'declined'>;

interface ImageModerationPanelProps {
  images?: ModerationImage[];
  isUpdating: boolean;
  onUpdateStatuses: (payload: ImageStatusUpdatePayload) => void;
}

interface ImageStatusUpdatePayload {
  approvedImageIds: string[];
  declinedImageIds: string[];
}

function ImageModerationPanel({
  images = [],
  isUpdating,
  onUpdateStatuses,
}: ImageModerationPanelProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, ImageDecision | undefined>
  >({});

  const selectedEntries = Object.entries(selectedStatuses).filter(
    (entry): entry is [string, ImageDecision] => Boolean(entry[1])
  );
  const hasSelectedImages = selectedEntries.length > 0;

  function handleImageDecisionChange(
    imageId: string,
    decision: ImageDecision,
    isChecked: boolean
  ) {
    setSelectedStatuses((currentStatuses) => ({
      ...currentStatuses,
      [imageId]: isChecked ? decision : undefined,
    }));
  }

  function handleUpdateStatuses() {
    const approvedImageIds = selectedEntries
      .filter(([, status]) => status === 'approved')
      .map(([imageId]) => imageId);
    const declinedImageIds = selectedEntries
      .filter(([, status]) => status === 'declined')
      .map(([imageId]) => imageId);

    onUpdateStatuses({ approvedImageIds, declinedImageIds });
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Attached images
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Select image moderation decisions before updating their statuses.
          </p>
        </div>
        <ActionButton
          intent="confirm"
          isDisabled={!hasSelectedImages || isUpdating}
          isLoading={isUpdating}
          onPress={handleUpdateStatuses}
        >
          Update images
        </ActionButton>
      </div>

      {images.length > 0 ? (
        <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <li
              key={image.imageId}
              className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <figure>
                <Image
                  alt={image.altText}
                  className="h-48 w-full object-cover"
                  radius="none"
                  removeWrapper
                  src={image.imagePath.md}
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
                      checked={selectedStatuses[image.imageId] === 'approved'}
                      imageId={image.imageId}
                      label="Approve image"
                      name={`approve-${image.imageId}`}
                      onChange={handleImageDecisionChange}
                      status="approved"
                    />
                    <ImageDecisionCheckbox
                      checked={selectedStatuses[image.imageId] === 'declined'}
                      imageId={image.imageId}
                      label="Decline image"
                      name={`decline-${image.imageId}`}
                      onChange={handleImageDecisionChange}
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
