import { ReactNode, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ImageModerationPanel, {
  ImageDecision,
  ImageStatusUpdatePayload,
} from './ImageModerationPanel';
import ModerationSubmitter from './ModerationSubmitter';
import { useModerationStandaloneImageGroup } from '../hooks/useModerationStandaloneImageGroup';
import { useUpdateStandaloneImageStatuses } from '../hooks/useUpdateStandaloneImageStatuses';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import {
  ModerationImage,
  ModerationStandaloneImageGroup,
  ModerationStatus,
} from '@/types/venueTypes';

function StandaloneImageModerationGroup() {
  const { groupId } = useParams();
  const [selectedImageStatuses, setSelectedImageStatuses] = useState<
    Record<string, ImageDecision | undefined>
  >({});
  const { error, imageGroup, isPending } =
    useModerationStandaloneImageGroup(groupId);
  const { isUpdating, updateImageStatuses } =
    useUpdateStandaloneImageStatuses(groupId);

  if (!groupId) {
    return (
      <DetailMessage
        title="Image group not found"
        message="This moderation item may have been removed."
      />
    );
  }

  if (isPending) {
    return <LoaderSpinner message="Loading standalone image group" />;
  }

  if (error) {
    return (
      <DetailMessage
        title="Image group could not be loaded"
        message="Try returning to the image queue and opening the group again."
      />
    );
  }

  if (!imageGroup) {
    return (
      <DetailMessage
        title="Image group not found"
        message="This moderation item may have been removed."
      />
    );
  }

  function handleImageDecisionChange(
    imageId: string,
    decision: ImageDecision,
    isChecked: boolean
  ) {
    setSelectedImageStatuses((currentStatuses) => ({
      ...currentStatuses,
      [imageId]: isChecked ? decision : undefined,
    }));
  }

  function handleUpdateImageStatuses(payload: ImageStatusUpdatePayload) {
    updateImageStatuses(payload, {
      onSuccess: () => {
        setSelectedImageStatuses({});
      },
    });
  }

  return (
    <section aria-labelledby="image-group-detail-title" className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            to="/admin/moderation/images"
            className="mb-3 inline-flex min-h-10 items-center rounded-full pr-4 text-sm text-gray-700 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Back to image queue
          </Link>
          <h2
            id="image-group-detail-title"
            className="text-2xl font-semibold text-gray-900"
          >
            {imageGroup.venueName ?? 'Standalone image group'}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600">
            Review each submitted standalone image before updating image
            statuses.
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <StatusSummaryPanel images={imageGroup.images} />
        <MetadataPanel imageGroup={imageGroup} />
      </div>

      <ImageModerationPanel
        images={imageGroup.images}
        isUpdating={isUpdating}
        onImageDecisionChange={handleImageDecisionChange}
        onUpdateStatuses={handleUpdateImageStatuses}
        selectedStatuses={selectedImageStatuses}
        title="Submitted images"
      />
    </section>
  );
}

function DetailMessage({ title, message }: { title: string; message: string }) {
  return (
    <section
      role="alert"
      className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm shadow-md"
      aria-labelledby="image-group-detail-message-title"
    >
      <h2
        id="image-group-detail-message-title"
        className="text-xl font-semibold"
      >
        {title}
      </h2>
      <p className="mt-2 text-zinc-600">{message}</p>
      <Link
        to="/admin/moderation/images"
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-primary-100 px-4 text-sm font-medium text-primary-700 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        Back to image queue
      </Link>
    </section>
  );
}

function StatusSummaryPanel({ images }: { images: ModerationImage[] }) {
  const counts = getImageStatusCounts(images);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">Image statuses</h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <DetailItem label="Pending">{counts.pending}</DetailItem>
        <DetailItem label="Approved">{counts.approved}</DetailItem>
        <DetailItem label="Declined">{counts.declined}</DetailItem>
      </dl>
    </section>
  );
}

function MetadataPanel({
  imageGroup,
}: {
  imageGroup: ModerationStandaloneImageGroup;
}) {
  const {
    city,
    groupId,
    imageCount,
    lastCreatedAt,
    userId,
    username,
    venueId,
    venueName,
    venueNameSlug,
  } = imageGroup;
  const formattedDate = formatSubmittedDate(lastCreatedAt, {
    includeTime: true,
  });

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">
        Submission metadata
      </h3>
      <dl className="mt-4 space-y-4">
        <DetailItem label="Submitted">
          <time dateTime={lastCreatedAt}>{formattedDate}</time>
        </DetailItem>
        <DetailItem label="Submitter">
          <ModerationSubmitter username={username} userId={userId} />
        </DetailItem>
        <DetailItem label="Venue">{venueName ?? 'Unknown venue'}</DetailItem>
        <DetailItem label="City">{city ?? 'Unknown city'}</DetailItem>
        <DetailItem label="Slug">{venueNameSlug ?? 'Unknown slug'}</DetailItem>
        <DetailItem label="Images">{imageCount}</DetailItem>
        <DetailItem label="Group id">
          <span className="break-all font-mono text-xs">{groupId}</span>
        </DetailItem>
        <DetailItem label="Venue id">
          <span className="break-all font-mono text-xs">{venueId}</span>
        </DetailItem>
      </dl>
    </section>
  );
}

function DetailItem({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-normal text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-gray-800">{children}</dd>
    </div>
  );
}

function getImageStatusCounts(
  images: ModerationImage[]
): Record<ModerationStatus, number> {
  return images.reduce<Record<ModerationStatus, number>>(
    (counts, image) => ({
      ...counts,
      [image.status]: counts[image.status] + 1,
    }),
    {
      approved: 0,
      declined: 0,
      pending: 0,
    }
  );
}

export default StandaloneImageModerationGroup;
