import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ActionButton from '@/ui/ActionButton';
import ImageModerationPanel, { ImageDecision } from './ImageModerationPanel';
import ModerationDetailItem from './ModerationDetailItem';
import ModerationDetailMessage from './ModerationDetailMessage';
import ModerationSubmitter from './ModerationSubmitter';
import { useModerationStandaloneImageGroup } from '../hooks/useModerationStandaloneImageGroup';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import { getImageStatusUpdatePayload } from '../utils/imageStatusPayload';
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
  const [isDecisionReady, setIsDecisionReady] = useState(false);
  const { error, imageGroup, isPending } =
    useModerationStandaloneImageGroup(groupId);

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

  const loadedImageGroup = imageGroup;
  const imageStatusUpdatePayload =
    getImageStatusUpdatePayload(selectedImageStatuses);
  const pendingImagesWithoutDecision = loadedImageGroup.images.filter(
    (image) =>
      image.status === 'pending' && !selectedImageStatuses[image.imageId]
  ).length;

  function handleImageDecisionChange(
    imageId: string,
    decision: ImageDecision,
    isChecked: boolean
  ) {
    setIsDecisionReady(false);
    setSelectedImageStatuses((currentStatuses) => ({
      ...currentStatuses,
      [imageId]: isChecked ? decision : undefined,
    }));
  }

  function handleMarkAllImages(decision: ImageDecision) {
    setIsDecisionReady(false);
    setSelectedImageStatuses(
      Object.fromEntries(
        loadedImageGroup.images.map((image) => [image.imageId, decision])
      )
    );
  }

  function handleProceedWithDecisions() {
    setIsDecisionReady(true);
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
            {loadedImageGroup.venueName ?? 'Standalone image group'}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600">
            Review each submitted standalone image before updating image
            statuses.
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <StatusSummaryPanel images={loadedImageGroup.images} />
        <div className="space-y-5">
          <StandaloneImageStatusActions
            images={loadedImageGroup.images}
            isDecisionReady={isDecisionReady}
            onMarkAll={handleMarkAllImages}
            onProceed={handleProceedWithDecisions}
            pendingImagesWithoutDecision={pendingImagesWithoutDecision}
            selectedStatuses={selectedImageStatuses}
            statusUpdatePayload={imageStatusUpdatePayload}
          />
          <MetadataPanel imageGroup={loadedImageGroup} />
        </div>
      </div>

      {/* No onUpdateStatuses: standalone decisions stay draft here until the */}
      {/* Step 20 notification flow lands and submits them alongside a notification. */}
      <ImageModerationPanel
        images={loadedImageGroup.images}
        onImageDecisionChange={handleImageDecisionChange}
        selectedStatuses={selectedImageStatuses}
        description="Choose per-image decisions here, then continue from the decision panel before saving changes."
        title="Submitted images"
      />
    </section>
  );
}

function StandaloneImageStatusActions({
  images,
  isDecisionReady,
  onMarkAll,
  onProceed,
  pendingImagesWithoutDecision,
  selectedStatuses,
  statusUpdatePayload,
}: {
  images: ModerationImage[];
  isDecisionReady: boolean;
  onMarkAll: (decision: ImageDecision) => void;
  onProceed: () => void;
  pendingImagesWithoutDecision: number;
  selectedStatuses: Record<string, ImageDecision | undefined>;
  statusUpdatePayload: {
    approvedImageIds: string[];
    declinedImageIds: string[];
  };
}) {
  const hasImages = images.length > 0;
  const draftCounts = getDraftImageStatusCounts(images, selectedStatuses);
  const hasSelectedDecisions =
    statusUpdatePayload.approvedImageIds.length +
      statusUpdatePayload.declinedImageIds.length >
    0;
  const canProceed =
    hasSelectedDecisions && pendingImagesWithoutDecision === 0;

  function handleMarkAllApproved() {
    onMarkAll('approved');
  }

  function handleMarkAllDeclined() {
    onMarkAll('declined');
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">Decision workflow</h3>
      <p className="mt-1 text-sm text-zinc-600">
        Review the draft image decisions, then proceed to the notification
        step before saving status changes.
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        <ModerationDetailItem label="Approve">{draftCounts.approved}</ModerationDetailItem>
        <ModerationDetailItem label="Decline">{draftCounts.declined}</ModerationDetailItem>
        <ModerationDetailItem label="Pending">
          {pendingImagesWithoutDecision}
        </ModerationDetailItem>
      </dl>

      {pendingImagesWithoutDecision > 0 ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Resolve every pending image before proceeding.
        </p>
      ) : null}

      {isDecisionReady ? (
        <p
          role="status"
          className="mt-3 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700"
        >
          Decisions are ready for the notification step. Image statuses have not
          been changed yet.
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <ActionButton
          intent="confirm"
          isDisabled={!hasImages}
          onPress={handleMarkAllApproved}
        >
          Mark all approved
        </ActionButton>
        <ActionButton
          intent="cancel"
          isDisabled={!hasImages}
          onPress={handleMarkAllDeclined}
        >
          Mark all declined
        </ActionButton>
      </div>

      <ActionButton
        className="mt-3 w-full"
        intent="confirm"
        isDisabled={!canProceed}
        onPress={onProceed}
      >
        Proceed with decisions
      </ActionButton>
    </section>
  );
}

function DetailMessage({ title, message }: { title: string; message: string }) {
  return (
    <ModerationDetailMessage
      title={title}
      message={message}
      backHref="/admin/moderation/images"
      backLabel="Back to image queue"
    />
  );
}

function StatusSummaryPanel({ images }: { images: ModerationImage[] }) {
  const counts = getImageStatusCounts(images);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">Image statuses</h3>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <ModerationDetailItem label="Pending">{counts.pending}</ModerationDetailItem>
        <ModerationDetailItem label="Approved">{counts.approved}</ModerationDetailItem>
        <ModerationDetailItem label="Declined">{counts.declined}</ModerationDetailItem>
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
        <ModerationDetailItem label="Submitted">
          <time dateTime={lastCreatedAt}>{formattedDate}</time>
        </ModerationDetailItem>
        <ModerationDetailItem label="Submitter">
          <ModerationSubmitter username={username} userId={userId} />
        </ModerationDetailItem>
        <ModerationDetailItem label="Venue">{venueName ?? 'Unknown venue'}</ModerationDetailItem>
        <ModerationDetailItem label="City">{city ?? 'Unknown city'}</ModerationDetailItem>
        <ModerationDetailItem label="Slug">{venueNameSlug ?? 'Unknown slug'}</ModerationDetailItem>
        <ModerationDetailItem label="Images">{imageCount}</ModerationDetailItem>
        <ModerationDetailItem label="Group id">
          <span className="break-all font-mono text-xs">{groupId}</span>
        </ModerationDetailItem>
        <ModerationDetailItem label="Venue id">
          <span className="break-all font-mono text-xs">{venueId}</span>
        </ModerationDetailItem>
      </dl>
    </section>
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

function getDraftImageStatusCounts(
  images: ModerationImage[],
  selectedStatuses: Record<string, ImageDecision | undefined>
): Record<ModerationStatus, number> {
  return images.reduce<Record<ModerationStatus, number>>(
    (counts, image) => {
      const status = selectedStatuses[image.imageId] ?? image.status;

      return {
        ...counts,
        [status]: counts[status] + 1,
      };
    },
    {
      approved: 0,
      declined: 0,
      pending: 0,
    }
  );
}

export default StandaloneImageModerationGroup;
