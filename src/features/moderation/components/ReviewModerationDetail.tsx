import clsx from 'clsx';
import { ReactNode, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ImageModerationPanel, {
  ImageDecision,
  ImageStatusUpdatePayload,
} from './ImageModerationPanel';
import ModerationSubmitter from './ModerationSubmitter';
import ReviewModerationEditForm from './ReviewModerationEditForm';
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from '../constants';
import { useModerationReview } from '../hooks/useModerationReview';
import { useUpdateModerationReview } from '../hooks/useUpdateModerationReview';
import { useUpdateReviewImageStatuses } from '../hooks/useUpdateReviewImageStatuses';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import { ModerationReview } from '@/types/reviewTypes';
import { ModerationStatus } from '@/types/venueTypes';

function ReviewModerationDetail() {
  const { reviewId } = useParams();
  const [selectedImageStatuses, setSelectedImageStatuses] = useState<
    Record<string, ImageDecision | undefined>
  >({});
  const { error, isPending, review } = useModerationReview(reviewId);
  const { isUpdating: isUpdatingImages, updateImageStatuses } =
    useUpdateReviewImageStatuses(reviewId);
  const { isUpdating: isUpdatingReview, updateReview } =
    useUpdateModerationReview();

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

  const reviewImages = review.venueImages ?? [];

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
    <section aria-labelledby="review-detail-title" className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            to="/admin/moderation/reviews"
            className="mb-3 inline-flex min-h-10 items-center rounded-full pr-4 text-sm text-gray-700 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Back to review queue
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2
              id="review-detail-title"
              className="text-2xl font-semibold text-gray-900"
            >
              {review.reviewTitle}
            </h2>
            <StatusBadge status={review.status} />
          </div>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600">
            Review the submitted ratings and comments before making a
            moderation decision.
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <div className="space-y-5">
          <article className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
            <h3 className="text-lg font-semibold text-gray-900">
              Review details
            </h3>
            <ReviewFields review={review} />
          </article>
          <ReviewModerationEditForm
            isUpdating={isUpdatingReview}
            key={review.reviewId}
            onUpdateReview={updateReview}
            review={review}
          />
        </div>

        <aside className="space-y-5">
          <MetadataPanel review={review} />
          <VenueContextPanel review={review} />
        </aside>
      </div>

      <ImageModerationPanel
        images={reviewImages}
        isUpdating={isUpdatingImages}
        onImageDecisionChange={handleImageDecisionChange}
        onUpdateStatuses={handleUpdateImageStatuses}
        selectedStatuses={selectedImageStatuses}
      />
    </section>
  );
}

function DetailMessage({ title, message }: { title: string; message: string }) {
  return (
    <section
      role="alert"
      className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm shadow-md"
      aria-labelledby="review-detail-message-title"
    >
      <h2 id="review-detail-message-title" className="text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-zinc-600">{message}</p>
      <Link
        to="/admin/moderation/reviews"
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-primary-100 px-4 text-sm font-medium text-primary-700 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        Back to review queue
      </Link>
    </section>
  );
}

function StatusBadge({ status }: { status: ModerationStatus }) {
  return (
    <span
      className={clsx(
        'rounded-full border px-2.5 py-1 text-xs font-semibold',
        STATUS_BADGE_CLASSES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
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
        <DetailItem label="Review type">
          <span className="capitalize">{reviewType}</span>
        </DetailItem>
        <DetailItem label="Ratings">
          Heat {heatRating} / Quality {qualityRating}
        </DetailItem>
        <DetailItem label="Hottest dish">
          {hottestDish || 'Not provided'}
        </DetailItem>
        <DetailItem label="Hottest sauce">
          {hottestSauce || 'Not provided'}
        </DetailItem>
      </dl>

      <DetailItem label="Review content">
        <p className="whitespace-pre-wrap text-gray-700">{reviewContent}</p>
      </DetailItem>
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
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">
        Submission metadata
      </h3>
      <dl className="mt-4 space-y-4">
        <DetailItem label="Submitted">
          <time dateTime={createdAt}>{formattedDate}</time>
        </DetailItem>
        <DetailItem label="Submitter">
          <ModerationSubmitter username={submitterUsername} userId={userId} />
        </DetailItem>
        <DetailItem label="Review id">
          <span className="break-all font-mono text-xs">{reviewId}</span>
        </DetailItem>
        <DetailItem label="Venue id">
          <span className="break-all font-mono text-xs">{venueId}</span>
        </DetailItem>
        <DetailItem label="Attached images">
          {venueImages?.length ?? 0}
        </DetailItem>
      </dl>
    </section>
  );
}

function VenueContextPanel({ review }: { review: ModerationReview }) {
  const venue = review.venueDetails;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">Venue context</h3>
      {venue ? (
        <dl className="mt-4 space-y-4">
          <DetailItem label="Venue">{venue.venueName}</DetailItem>
          <DetailItem label="Location">
            {venue.city}, {venue.country}
          </DetailItem>
          <DetailItem label="Slug">{venue.venueNameSlug}</DetailItem>
          <DetailItem label="Type">
            <span className="capitalize">{venue.venueType}</span>
          </DetailItem>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-zinc-600">
          Venue context is not available for this review.
        </p>
      )}
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

export default ReviewModerationDetail;
