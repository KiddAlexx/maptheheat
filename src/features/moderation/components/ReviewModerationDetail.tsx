import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ImageModerationPanel, {
  ImageDecision,
  ImageStatusUpdatePayload,
} from './ImageModerationPanel';
import ModerationDetailItem from './ModerationDetailItem';
import ModerationDetailMessage from './ModerationDetailMessage';
import ModerationNotificationComposer from './ModerationNotificationComposer';
import ModerationStatusActions from './ModerationStatusActions';
import ModerationStatusBadge from './ModerationStatusBadge';
import ModerationSubmitter from './ModerationSubmitter';
import ReviewModerationEditForm from './ReviewModerationEditForm';
import type { ModerationNotificationDecision } from './notificationTemplates';
import { useModerationReview } from '../hooks/useModerationReview';
import {
  useModerationNotificationDraft,
  type ModerationNotificationDraftSnapshot,
} from '../hooks/useModerationNotificationDraft';
import { useUpdateModerationReview } from '../hooks/useUpdateModerationReview';
import { useUpdateModerationReviewStatus } from '../hooks/useUpdateModerationReviewStatus';
import { useUpdateReviewImageStatuses } from '../hooks/useUpdateReviewImageStatuses';
import { useSetVenueThumbnail } from '../hooks/useSetVenueThumbnail';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import {
  getImageStatusUpdatePayload,
  hasImageStatusUpdates,
} from '../utils/imageStatusPayload';
import { ModerationReview } from '@/types/reviewTypes';
import { buildVenueShareUrl } from '@/utils/buildVenueShareUrl';

function ReviewModerationDetail() {
  const { reviewId } = useParams();
  const [selectedImageStatuses, setSelectedImageStatuses] = useState<
    Record<string, ImageDecision | undefined>
  >({});
  const {
    hasEdited: hasEditedReview,
    markEdited,
    notificationDraft,
    setNotificationDraft,
  } = useModerationNotificationDraft();
  const { error, isPending, review } = useModerationReview(reviewId);
  const { isUpdating: isUpdatingImages, updateImageStatuses } =
    useUpdateReviewImageStatuses(reviewId);
  const { isUpdating: isUpdatingReview, updateReview } =
    useUpdateModerationReview();
  const { isUpdating: isUpdatingReviewStatus, updateStatus } =
    useUpdateModerationReviewStatus();
  const { setThumbnail } = useSetVenueThumbnail(review?.venueId ?? '');

  if (!reviewId) {
    return (
      <DetailMessage
        title="Review submission not found"
        message="This moderation item may have been removed."
      />
    );
  }

  if (isPending) {
    return <LoaderSpinner message="Loading review submission" />;
  }

  if (error) {
    return (
      <DetailMessage
        title="Review submission could not be loaded"
        message="Try returning to the review queue and opening the submission again."
      />
    );
  }

  if (!review) {
    return (
      <DetailMessage
        title="Review submission not found"
        message="This moderation item may have been removed."
      />
    );
  }

  const loadedReview = review;
  const reviewImages = loadedReview.venueImages ?? [];
  const imageStatusUpdatePayload =
    getImageStatusUpdatePayload(selectedImageStatuses);
  const hasPendingImageWithoutDecision = reviewImages.some(
    (image) =>
      image.status === 'pending' && !selectedImageStatuses[image.imageId]
  );

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

  function handleUpdateReview(payload: {
    reviewId: string;
    reviewUpdate: Partial<ModerationReview>;
  }) {
    updateReview(payload, {
      onSuccess: () => {
        markEdited();
      },
    });
  }

  function handleApproveReview() {
    if (hasPendingImageWithoutDecision) return;

    const draft = getReviewNotificationDraft(loadedReview, {
      decision: hasEditedReview ? 'partial' : 'approved',
      includeLink: true,
      mentionEdits: hasEditedReview,
    });

    if (hasImageStatusUpdates(imageStatusUpdatePayload)) {
      updateImageStatuses(imageStatusUpdatePayload, {
        onSuccess: () => {
          setSelectedImageStatuses({});
          updateStatus(
            {
              reviewId: loadedReview.reviewId,
              status: 'approved',
            },
            {
              onSuccess: () => {
                setNotificationDraft(draft);
              },
            }
          );
        },
      });
      return;
    }

    updateStatus(
      { reviewId: loadedReview.reviewId, status: 'approved' },
      {
        onSuccess: () => {
          setNotificationDraft(draft);
        },
      }
    );
  }

  function handleDeclineReview() {
    const draft = getReviewNotificationDraft(loadedReview, {
      decision: 'declined',
      includeLink: false,
      mentionEdits: false,
    });

    updateStatus(
      { reviewId: loadedReview.reviewId, status: 'declined' },
      {
        onSuccess: () => {
          setNotificationDraft(draft);
        },
      }
    );
  }

  return (
    <section aria-labelledby="review-detail-title" className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            to="/admin/moderation/reviews"
            className="mb-3 inline-flex min-h-10 items-center rounded-full pr-4 text-sm text-app-muted hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Back to review queue
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2
              id="review-detail-title"
              className="text-2xl font-semibold"
            >
              {loadedReview.reviewTitle}
            </h2>
            <ModerationStatusBadge status={loadedReview.status} />
          </div>
          <p className="mt-1 max-w-3xl text-sm text-app-muted">
            Review the submitted ratings and comments before making a
            moderation decision.
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <div className="space-y-5">
          <article className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
            <h3 className="text-lg font-semibold">
              Review details
            </h3>
            <ReviewFields review={loadedReview} />
          </article>
          <ReviewModerationEditForm
            isUpdating={isUpdatingReview}
            key={loadedReview.reviewId}
            onUpdateReview={handleUpdateReview}
            review={loadedReview}
          />
        </div>

        <aside className="space-y-5">
          <ModerationStatusActions
            hasPendingImageWithoutDecision={hasPendingImageWithoutDecision}
            isUpdating={isUpdatingReviewStatus || isUpdatingImages}
            onApprove={handleApproveReview}
            onDecline={handleDeclineReview}
            resourceLabel="review"
            status={loadedReview.status}
          />
          {notificationDraft ? (
            <ModerationNotificationComposer
              key={`${notificationDraft.venueId}-${notificationDraft.decision}`}
              decision={notificationDraft.decision}
              includeLink={notificationDraft.includeLink}
              linkUrl={notificationDraft.linkUrl}
              mentionEdits={notificationDraft.mentionEdits}
              mode="moderation"
              recipientUserId={notificationDraft.recipientUserId}
              recipientUsername={notificationDraft.recipientUsername}
              relatedType="review"
              venueId={notificationDraft.venueId}
              venueName={notificationDraft.venueName}
            />
          ) : null}
          <MetadataPanel review={loadedReview} />
          <VenueContextPanel review={loadedReview} />
        </aside>
      </div>

      <ImageModerationPanel
        currentThumbnailUrl={loadedReview.venueDetails?.thumbnailImage?.url}
        images={reviewImages}
        isUpdating={isUpdatingImages}
        onImageDecisionChange={handleImageDecisionChange}
        onSetThumbnail={(image) =>
          setThumbnail({ venueId: loadedReview.venueId, url: image.imagePath.sm, altText: image.altText })
        }
        onUpdateStatuses={handleUpdateImageStatuses}
        selectedStatuses={selectedImageStatuses}
      />
    </section>
  );
}

function getReviewNotificationDraft(
  review: ModerationReview,
  {
    decision,
    includeLink,
    mentionEdits,
  }: {
    decision: ModerationNotificationDecision;
    includeLink: boolean;
    mentionEdits: boolean;
  }
): ModerationNotificationDraftSnapshot {
  const venue = review.venueDetails;

  return {
    decision,
    includeLink,
    linkUrl: includeLink && venue ? buildVenueShareUrl(venue) : null,
    mentionEdits,
    recipientUserId: review.userId ?? '',
    recipientUsername: review.submitterUsername,
    venueId: review.venueId,
    venueName: venue?.venueName ?? 'this venue',
  };
}

function DetailMessage({ title, message }: { title: string; message: string }) {
  return (
    <ModerationDetailMessage
      title={title}
      message={message}
      backHref="/admin/moderation/reviews"
      backLabel="Back to review queue"
    />
  );
}

function ReviewFields({ review }: { review: ModerationReview }) {
  const {
    heatRating,
    hottestDish,
    hottestSauce,
    qualityRating,
    reviewContent,
    reviewType,
  } = review;

  return (
    <div className="mt-4 space-y-5">
      <dl className="grid gap-4 md:grid-cols-2">
        <ModerationDetailItem label="Review type">
          <span className="capitalize">{reviewType}</span>
        </ModerationDetailItem>
        <ModerationDetailItem label="Ratings">
          Heat {heatRating} / Quality {qualityRating}
        </ModerationDetailItem>
        <ModerationDetailItem label="Hottest dish">
          {hottestDish || 'Not provided'}
        </ModerationDetailItem>
        <ModerationDetailItem label="Hottest sauce">
          {hottestSauce || 'Not provided'}
        </ModerationDetailItem>
      </dl>

      <ModerationDetailItem label="Review content">
        <p className="whitespace-pre-wrap text-app-muted">{reviewContent}</p>
      </ModerationDetailItem>
    </div>
  );
}

function MetadataPanel({ review }: { review: ModerationReview }) {
  const {
    createdAt,
    reviewId,
    submitterUsername,
    userId,
    venueId,
    venueImages,
  } = review;
  const formattedDate = formatSubmittedDate(createdAt, { includeTime: true });

  return (
    <section className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold">
        Submission metadata
      </h3>
      <dl className="mt-4 space-y-4">
        <ModerationDetailItem label="Submitted">
          <time dateTime={createdAt}>{formattedDate}</time>
        </ModerationDetailItem>
        <ModerationDetailItem label="Submitter">
          <ModerationSubmitter username={submitterUsername} userId={userId} />
        </ModerationDetailItem>
        <ModerationDetailItem label="Review id">
          <span className="break-all font-mono text-xs">{reviewId}</span>
        </ModerationDetailItem>
        <ModerationDetailItem label="Venue id">
          <span className="break-all font-mono text-xs">{venueId}</span>
        </ModerationDetailItem>
        <ModerationDetailItem label="Attached images">
          {venueImages?.length ?? 0}
        </ModerationDetailItem>
      </dl>
    </section>
  );
}

function VenueContextPanel({ review }: { review: ModerationReview }) {
  const venue = review.venueDetails;

  return (
    <section className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold">Venue context</h3>
      {venue ? (
        <dl className="mt-4 space-y-4">
          <ModerationDetailItem label="Venue">{venue.venueName}</ModerationDetailItem>
          <ModerationDetailItem label="Location">
            {venue.city}, {venue.country}
          </ModerationDetailItem>
          <ModerationDetailItem label="Slug">{venue.venueNameSlug}</ModerationDetailItem>
          <ModerationDetailItem label="Type">
            <span className="capitalize">{venue.venueType}</span>
          </ModerationDetailItem>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-app-muted">
          Venue context is not available for this review.
        </p>
      )}
    </section>
  );
}


export default ReviewModerationDetail;
