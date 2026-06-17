import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ActionButton from '@/ui/ActionButton';
import ImageModerationPanel, { ImageDecision } from './ImageModerationPanel';
import ModerationDetailItem from './ModerationDetailItem';
import ModerationDetailMessage from './ModerationDetailMessage';
import ModerationNotificationComposer from './ModerationNotificationComposer';
import ModerationSubmitter from './ModerationSubmitter';
import type { ModerationNotificationDecision } from './notificationTemplates';
import { useModerationStandaloneImageGroup } from '../hooks/useModerationStandaloneImageGroup';
import { useUpdateStandaloneImageStatuses } from '../hooks/useUpdateStandaloneImageStatuses';
import { useSetVenueThumbnail } from '../hooks/useSetVenueThumbnail';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import {
  getImageStatusUpdatePayload,
  hasImageStatusUpdates,
} from '../utils/imageStatusPayload';
import {
  ModerationImage,
  ModerationStandaloneImageGroup,
  ModerationStatus,
} from '@/types/venueTypes';
import { buildVenueShareUrl } from '@/utils/buildVenueShareUrl';

interface ImageNotificationDraft {
  decision: ModerationNotificationDecision;
  imageCounts: {
    approved: number;
    declined: number;
  };
  includeLink: boolean;
  linkUrl: string | null;
  mentionImagesDeclined: boolean;
  recipientUserId: string;
  recipientUsername?: string | null;
  venueId: string;
  venueName: string;
}

function StandaloneImageModerationGroup() {
  const { groupId } = useParams();
  const [selectedImageStatuses, setSelectedImageStatuses] = useState<
    Record<string, ImageDecision | undefined>
  >({});
  const [savedImageGroupSnapshot, setSavedImageGroupSnapshot] =
    useState<ModerationStandaloneImageGroup | null>(null);
  const [notificationDraft, setNotificationDraft] =
    useState<ImageNotificationDraft | null>(null);
  const { error, imageGroup, isPending } =
    useModerationStandaloneImageGroup(groupId);
  const { isUpdating, updateImageStatuses } =
    useUpdateStandaloneImageStatuses(groupId);
  const { setThumbnail } = useSetVenueThumbnail(imageGroup?.venueId ?? '');

  if (!groupId) {
    return (
      <DetailMessage
        title="Image group not found"
        message="This moderation item may have been removed."
      />
    );
  }

  if (isPending && !savedImageGroupSnapshot) {
    return <LoaderSpinner message="Loading standalone image group" />;
  }

  if (error && !savedImageGroupSnapshot) {
    return (
      <DetailMessage
        title="Image group could not be loaded"
        message="Try returning to the image queue and opening the group again."
      />
    );
  }

  const currentImageGroup = savedImageGroupSnapshot ?? imageGroup;

  if (!currentImageGroup) {
    return (
      <DetailMessage
        title="Image group not found"
        message="This moderation item may have been removed."
      />
    );
  }

  const loadedImageGroup: ModerationStandaloneImageGroup = currentImageGroup;
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
    setNotificationDraft(null);
    setSelectedImageStatuses((currentStatuses) => ({
      ...currentStatuses,
      [imageId]: isChecked ? decision : undefined,
    }));
  }

  function handleMarkAllImages(decision: ImageDecision) {
    setNotificationDraft(null);
    setSelectedImageStatuses(
      Object.fromEntries(
        loadedImageGroup.images.map((image) => [image.imageId, decision])
      )
    );
  }

  function handleSaveDecisions() {
    if (!hasImageStatusUpdates(imageStatusUpdatePayload)) return;

    const draft = getImageNotificationDraft(
      loadedImageGroup,
      imageStatusUpdatePayload
    );
    const nextImageGroupSnapshot = getImageGroupWithDraftStatuses(
      loadedImageGroup,
      selectedImageStatuses
    );

    setSavedImageGroupSnapshot(nextImageGroupSnapshot);
    updateImageStatuses(imageStatusUpdatePayload, {
      onSuccess: () => {
        setSelectedImageStatuses({});
        setNotificationDraft(draft);
      },
    });
  }

  return (
    <section aria-labelledby="image-group-detail-title" className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            to="/admin/moderation/images"
            className="mb-3 inline-flex min-h-10 items-center rounded-full pr-4 text-sm text-app-muted hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Back to image queue
          </Link>
          <h2
            id="image-group-detail-title"
            className="text-2xl font-semibold"
          >
            {loadedImageGroup.venueName ?? 'Standalone image group'}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-app-muted">
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
            isUpdating={isUpdating}
            onMarkAll={handleMarkAllImages}
            onSave={handleSaveDecisions}
            pendingImagesWithoutDecision={pendingImagesWithoutDecision}
            selectedStatuses={selectedImageStatuses}
            statusUpdatePayload={imageStatusUpdatePayload}
          />
          {notificationDraft ? (
            <ModerationNotificationComposer
              key={`${notificationDraft.venueId}-${notificationDraft.decision}-${notificationDraft.imageCounts.approved}-${notificationDraft.imageCounts.declined}`}
              decision={notificationDraft.decision}
              includeLink={notificationDraft.includeLink}
              linkUrl={notificationDraft.linkUrl}
              mentionImagesDeclined={notificationDraft.mentionImagesDeclined}
              mode="moderation"
              recipientUserId={notificationDraft.recipientUserId}
              recipientUsername={notificationDraft.recipientUsername}
              relatedType="image"
              venueId={notificationDraft.venueId}
              venueName={notificationDraft.venueName}
            />
          ) : null}
          <MetadataPanel imageGroup={loadedImageGroup} />
        </div>
      </div>

      {/* No onUpdateStatuses: standalone decisions save from the workflow panel so */}
      {/* the notification draft can snapshot before the moderation update runs. */}
      <ImageModerationPanel
        images={loadedImageGroup.images}
        onImageDecisionChange={handleImageDecisionChange}
        onSetThumbnail={(image) =>
          setThumbnail({ venueId: loadedImageGroup.venueId, url: image.imagePath.sm, altText: image.altText })
        }
        selectedStatuses={selectedImageStatuses}
        description="Choose per-image decisions here, then continue from the decision panel before saving changes."
        title="Submitted images"
      />
    </section>
  );
}

function StandaloneImageStatusActions({
  images,
  isUpdating,
  onMarkAll,
  onSave,
  pendingImagesWithoutDecision,
  selectedStatuses,
  statusUpdatePayload,
}: {
  images: ModerationImage[];
  isUpdating: boolean;
  onMarkAll: (decision: ImageDecision) => void;
  onSave: () => void;
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
    <section className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold">Decision workflow</h3>
      <p className="mt-1 text-sm text-app-muted">
        Review the draft image decisions, then save them before sending the
        notification.
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        <ModerationDetailItem label="Approve">{draftCounts.approved}</ModerationDetailItem>
        <ModerationDetailItem label="Decline">{draftCounts.declined}</ModerationDetailItem>
        <ModerationDetailItem label="Pending">
          {pendingImagesWithoutDecision}
        </ModerationDetailItem>
      </dl>

      {pendingImagesWithoutDecision > 0 ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          Resolve every pending image before proceeding.
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
        <ActionButton
          intent="confirm"
          isDisabled={!hasImages || isUpdating}
          onPress={handleMarkAllApproved}
        >
          Mark all approved
        </ActionButton>
        <ActionButton
          intent="cancel"
          isDisabled={!hasImages || isUpdating}
          onPress={handleMarkAllDeclined}
        >
          Mark all declined
        </ActionButton>
      </div>

      <ActionButton
        className="mt-3 w-full"
        intent="confirm"
        isDisabled={!canProceed || isUpdating}
        isLoading={isUpdating}
        onPress={onSave}
      >
        Save decisions and prepare notification
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
    <section className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold">Image statuses</h3>
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
    country,
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
    <section className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold">
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
        <ModerationDetailItem label="Country">
          {country ?? 'Unknown country'}
        </ModerationDetailItem>
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

function getImageNotificationDraft(
  imageGroup: ModerationStandaloneImageGroup,
  statusUpdatePayload: {
    approvedImageIds: string[];
    declinedImageIds: string[];
  }
): ImageNotificationDraft {
  const decision = getImageNotificationDecision(statusUpdatePayload);
  const linkUrl = getStandaloneVenueShareUrl(imageGroup);

  return {
    decision,
    imageCounts: {
      approved: statusUpdatePayload.approvedImageIds.length,
      declined: statusUpdatePayload.declinedImageIds.length,
    },
    includeLink: Boolean(linkUrl),
    linkUrl,
    mentionImagesDeclined: decision === 'partial',
    recipientUserId: imageGroup.userId,
    recipientUsername: imageGroup.username,
    venueId: imageGroup.venueId,
    venueName: imageGroup.venueName ?? 'this venue',
  };
}

function getImageNotificationDecision({
  approvedImageIds,
  declinedImageIds,
}: {
  approvedImageIds: string[];
  declinedImageIds: string[];
}): ModerationNotificationDecision {
  if (approvedImageIds.length > 0 && declinedImageIds.length === 0) {
    return 'approved';
  }

  if (declinedImageIds.length > 0 && approvedImageIds.length === 0) {
    return 'declined';
  }

  return 'partial';
}

function getStandaloneVenueShareUrl(
  imageGroup: ModerationStandaloneImageGroup
): string | null {
  const { city, country, venueId, venueNameSlug } = imageGroup;

  if (!city || !country || !venueNameSlug) return null;

  return buildVenueShareUrl({
    city,
    country,
    venueId,
    venueNameSlug,
  });
}

function getImageGroupWithDraftStatuses(
  imageGroup: ModerationStandaloneImageGroup,
  selectedStatuses: Record<string, ImageDecision | undefined>
): ModerationStandaloneImageGroup {
  return {
    ...imageGroup,
    images: imageGroup.images.map((image) => ({
      ...image,
      status: selectedStatuses[image.imageId] ?? image.status,
    })),
  };
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
