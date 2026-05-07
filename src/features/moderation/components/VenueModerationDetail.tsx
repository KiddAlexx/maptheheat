import clsx from 'clsx';
import { ReactNode, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ActionButton from '@/ui/ActionButton';
import ImageModerationPanel, {
  ImageDecision,
  ImageStatusUpdatePayload,
} from './ImageModerationPanel';
import ModerationSubmitter from './ModerationSubmitter';
import VenueModerationEditForm from './VenueModerationEditForm';
import { useModerationVenue } from '../hooks/useModerationVenue';
import { useUpdateVenueImageStatuses } from '../hooks/useUpdateVenueImageStatuses';
import { useUpdateModerationVenue } from '../hooks/useUpdateModerationVenue';
import { useUpdateModerationVenueStatus } from '../hooks/useUpdateModerationVenueStatus';
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from '../constants';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import {
  getImageStatusUpdatePayload,
  hasImageStatusUpdates,
} from '../utils/imageStatusPayload';
import { ModerationStatus, ModerationVenue } from '@/types/venueTypes';

function formatCoordinate(value: number | string) {
  return typeof value === 'number' ? value.toFixed(5) : value;
}

function VenueModerationDetail() {
  const { venueId } = useParams();
  const [selectedImageStatuses, setSelectedImageStatuses] = useState<
    Record<string, ImageDecision | undefined>
  >({});
  const { error, isPending, venue } = useModerationVenue(venueId);
  const { isUpdating: isUpdatingImages, updateImageStatuses } =
    useUpdateVenueImageStatuses(venueId);
  const { isUpdating: isUpdatingVenue, updateVenue } =
    useUpdateModerationVenue();
  const { isUpdating: isUpdatingVenueStatus, updateStatus } =
    useUpdateModerationVenueStatus();

  if (!venueId) {
    return (
      <DetailMessage
        title="Venue submission not found"
        message="This moderation item may have been removed."
      />
    );
  }

  if (isPending) {
    return <LoaderSpinner message="Loading venue submission" />;
  }

  if (error) {
    return (
      <DetailMessage
        title="Venue submission could not be loaded"
        message="Try returning to the venue queue and opening the submission again."
      />
    );
  }

  if (!venue) {
    return (
      <DetailMessage
        title="Venue submission not found"
        message="This moderation item may have been removed."
      />
    );
  }

  const loadedVenue = venue;
  const venueImages = loadedVenue.venueImages ?? [];
  const imageStatusUpdatePayload =
    getImageStatusUpdatePayload(selectedImageStatuses);
  const hasPendingImageWithoutDecision = venueImages.some(
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

  function handleApproveVenue() {
    if (hasPendingImageWithoutDecision) return;

    if (hasImageStatusUpdates(imageStatusUpdatePayload)) {
      updateImageStatuses(imageStatusUpdatePayload, {
        onSuccess: () => {
          setSelectedImageStatuses({});
          updateStatus({ venueId: loadedVenue.venueId, status: 'approved' });
        },
      });
      return;
    }

    updateStatus({ venueId: loadedVenue.venueId, status: 'approved' });
  }

  function handleDeclineVenue() {
    updateStatus({ venueId: loadedVenue.venueId, status: 'declined' });
  }

  return (
    <section aria-labelledby="venue-detail-title" className="space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            to="/admin/moderation/venues"
            className="mb-3 inline-flex min-h-10 items-center rounded-full pr-4 text-sm text-gray-700 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Back to venue queue
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2
              id="venue-detail-title"
              className="text-2xl font-semibold text-gray-900"
            >
              {venue.venueName}
            </h2>
            <StatusBadge status={venue.status} />
          </div>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600">
            Review the submitted venue details before making a moderation
            decision.
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]">
        <div className="space-y-5">
          <article className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
            <h3 className="text-lg font-semibold text-gray-900">
              Venue details
            </h3>
            <VenueFields venue={venue} />
          </article>
          <VenueModerationEditForm
            isUpdating={isUpdatingVenue}
            key={venue.venueId}
            onUpdateVenue={updateVenue}
            venue={venue}
          />
        </div>

        <aside className="space-y-5">
          <VenueStatusActions
            hasPendingImageWithoutDecision={hasPendingImageWithoutDecision}
            isUpdating={isUpdatingVenueStatus || isUpdatingImages}
            onApprove={handleApproveVenue}
            onDecline={handleDeclineVenue}
            status={venue.status}
          />
          <MetadataPanel venue={venue} />
          <ClassificationPanel venue={venue} />
        </aside>
      </div>

      <ImageModerationPanel
        images={venueImages}
        isUpdating={isUpdatingImages}
        onImageDecisionChange={handleImageDecisionChange}
        onUpdateStatuses={handleUpdateImageStatuses}
        selectedStatuses={selectedImageStatuses}
      />
    </section>
  );
}

function VenueStatusActions({
  hasPendingImageWithoutDecision,
  isUpdating,
  onApprove,
  onDecline,
  status,
}: {
  hasPendingImageWithoutDecision: boolean;
  isUpdating: boolean;
  onApprove: () => void;
  onDecline: () => void;
  status: ModerationStatus;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">Venue decision</h3>
      <p className="mt-1 text-sm text-zinc-600">
        Set the final status for this venue submission.
      </p>
      {hasPendingImageWithoutDecision ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Resolve all pending image decisions before approving this venue.
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <ActionButton
          intent="confirm"
          isDisabled={
            status === 'approved' || isUpdating || hasPendingImageWithoutDecision
          }
          isLoading={isUpdating}
          onPress={onApprove}
        >
          Approve venue
        </ActionButton>
        <ActionButton
          intent="cancel"
          isDisabled={status === 'declined' || isUpdating}
          isLoading={isUpdating}
          onPress={onDecline}
        >
          Decline venue
        </ActionButton>
      </div>
    </section>
  );
}

function DetailMessage({ title, message }: { title: string; message: string }) {
  return (
    <section
      role="alert"
      className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm shadow-md"
      aria-labelledby="venue-detail-message-title"
    >
      <h2 id="venue-detail-message-title" className="text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-zinc-600">{message}</p>
      <Link
        to="/admin/moderation/venues"
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-primary-100 px-4 text-sm font-medium text-primary-700 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        Back to venue queue
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

function VenueFields({ venue }: { venue: ModerationVenue }) {
  const {
    address,
    city,
    coords,
    country,
    description,
    detailedAddress,
    phoneNumber,
    postcode,
    venueNameSlug,
    venueType,
    website,
  } = venue;

  return (
    <div className="mt-4 space-y-5">
      <dl className="grid gap-4 md:grid-cols-2">
        <DetailItem label="Type">
          <span className="capitalize">{venueType}</span>
        </DetailItem>
        <DetailItem label="Slug">{venueNameSlug}</DetailItem>
        <DetailItem label="City">{city}</DetailItem>
        <DetailItem label="Country">{country}</DetailItem>
        <DetailItem label="Address">{address}</DetailItem>
        <DetailItem label="Postcode">{postcode || 'Not provided'}</DetailItem>
        <DetailItem label="Phone">{phoneNumber || 'Not provided'}</DetailItem>
        <DetailItem label="Coordinates">
          {formatCoordinate(coords.lat)}, {formatCoordinate(coords.lon)}
        </DetailItem>
      </dl>

      <DetailItem label="Detailed address">{detailedAddress}</DetailItem>

      <DetailItem label="Website">
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-primary-700 underline underline-offset-2 hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {website}
          </a>
        ) : (
          'Not provided'
        )}
      </DetailItem>

      <DetailItem label="Description">
        <p className="whitespace-pre-wrap text-gray-700">{description}</p>
      </DetailItem>
    </div>
  );
}

function MetadataPanel({ venue }: { venue: ModerationVenue }) {
  const { createdAt, submitterUsername, userId, venueId, venueImages } = venue;
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

function ClassificationPanel({ venue }: { venue: ModerationVenue }) {
  const tags = [
    ...(venue.cuisines ?? []),
    ...(venue.dietaryOptions ?? []),
    ...(venue.hottestSauces ?? []),
    ...(venue.hottestDishes ?? []),
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">
        Submitted attributes
      </h3>
      {tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-zinc-600">No attributes submitted.</p>
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

export default VenueModerationDetail;
