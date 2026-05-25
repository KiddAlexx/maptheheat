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
import VenueModerationEditForm from './VenueModerationEditForm';
import { useModerationVenue } from '../hooks/useModerationVenue';
import {
  useModerationNotificationDraft,
  type ModerationNotificationDraftSnapshot,
} from '../hooks/useModerationNotificationDraft';
import type { ModerationNotificationDecision } from './notificationTemplates';
import { useUpdateVenueImageStatuses } from '../hooks/useUpdateVenueImageStatuses';
import { useUpdateModerationVenue } from '../hooks/useUpdateModerationVenue';
import { useUpdateModerationVenueStatus } from '../hooks/useUpdateModerationVenueStatus';
import { useSetVenueThumbnail } from '../hooks/useSetVenueThumbnail';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import {
  getImageStatusUpdatePayload,
  hasImageStatusUpdates,
} from '../utils/imageStatusPayload';
import { ModerationVenue } from '@/types/venueTypes';
import { buildVenueShareUrl } from '@/utils/buildVenueShareUrl';

function formatCoordinate(value: number | string) {
  return typeof value === 'number' ? value.toFixed(5) : value;
}

function VenueModerationDetail() {
  const { venueId } = useParams();
  const [selectedImageStatuses, setSelectedImageStatuses] = useState<
    Record<string, ImageDecision | undefined>
  >({});
  const {
    hasEdited: hasEditedVenue,
    markEdited,
    notificationDraft,
    setNotificationDraft,
  } = useModerationNotificationDraft();
  const { error, isPending, venue } = useModerationVenue(venueId);
  const { isUpdating: isUpdatingImages, updateImageStatuses } =
    useUpdateVenueImageStatuses(venueId);
  const { isUpdating: isUpdatingVenue, updateVenue } =
    useUpdateModerationVenue();
  const { isUpdating: isUpdatingVenueStatus, updateStatus } =
    useUpdateModerationVenueStatus();
  const { setThumbnail } = useSetVenueThumbnail(venueId ?? '');

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

  function handleUpdateVenue(payload: {
    venueId: string;
    venueUpdate: Partial<ModerationVenue>;
  }) {
    updateVenue(payload, {
      onSuccess: () => {
        markEdited();
      },
    });
  }

  function handleApproveVenue() {
    if (hasPendingImageWithoutDecision) return;

    const draft = getVenueNotificationDraft(loadedVenue, {
      decision: hasEditedVenue ? 'partial' : 'approved',
      includeLink: true,
      mentionEdits: hasEditedVenue,
    });

    if (hasImageStatusUpdates(imageStatusUpdatePayload)) {
      updateImageStatuses(imageStatusUpdatePayload, {
        onSuccess: () => {
          setSelectedImageStatuses({});
          updateStatus(
            { venueId: loadedVenue.venueId, status: 'approved' },
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
      { venueId: loadedVenue.venueId, status: 'approved' },
      {
        onSuccess: () => {
          setNotificationDraft(draft);
        },
      }
    );
  }

  function handleDeclineVenue() {
    const draft = getVenueNotificationDraft(loadedVenue, {
      decision: 'declined',
      includeLink: false,
      mentionEdits: false,
    });

    updateStatus(
      { venueId: loadedVenue.venueId, status: 'declined' },
      {
        onSuccess: () => {
          setNotificationDraft(draft);
        },
      }
    );
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
            <ModerationStatusBadge status={venue.status} />
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
            onUpdateVenue={handleUpdateVenue}
            venue={venue}
          />
        </div>

        <aside className="space-y-5">
          <ModerationStatusActions
            hasPendingImageWithoutDecision={hasPendingImageWithoutDecision}
            isUpdating={isUpdatingVenueStatus || isUpdatingImages}
            onApprove={handleApproveVenue}
            onDecline={handleDeclineVenue}
            resourceLabel="venue"
            status={venue.status}
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
              relatedType="venue"
              venueId={notificationDraft.venueId}
              venueName={notificationDraft.venueName}
            />
          ) : null}
          <MetadataPanel venue={venue} />
          <ClassificationPanel venue={venue} />
        </aside>
      </div>

      <ImageModerationPanel
        currentThumbnailUrl={loadedVenue.thumbnailImage?.url}
        images={venueImages}
        isUpdating={isUpdatingImages}
        onImageDecisionChange={handleImageDecisionChange}
        onSetThumbnail={(image) =>
          setThumbnail({ venueId: venueId!, url: image.imagePath.sm, altText: image.altText })
        }
        onUpdateStatuses={handleUpdateImageStatuses}
        selectedStatuses={selectedImageStatuses}
      />
    </section>
  );
}

function getVenueNotificationDraft(
  venue: ModerationVenue,
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
  return {
    decision,
    includeLink,
    linkUrl: includeLink ? buildVenueShareUrl(venue) : null,
    mentionEdits,
    recipientUserId: venue.userId,
    recipientUsername: venue.submitterUsername,
    venueId: venue.venueId,
    venueName: venue.venueName,
  };
}

function DetailMessage({ title, message }: { title: string; message: string }) {
  return (
    <ModerationDetailMessage
      title={title}
      message={message}
      backHref="/admin/moderation/venues"
      backLabel="Back to venue queue"
    />
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
        <ModerationDetailItem label="Type">
          <span className="capitalize">{venueType}</span>
        </ModerationDetailItem>
        <ModerationDetailItem label="Slug">{venueNameSlug}</ModerationDetailItem>
        <ModerationDetailItem label="City">{city}</ModerationDetailItem>
        <ModerationDetailItem label="Country">{country}</ModerationDetailItem>
        <ModerationDetailItem label="Address">{address}</ModerationDetailItem>
        <ModerationDetailItem label="Postcode">{postcode || 'Not provided'}</ModerationDetailItem>
        <ModerationDetailItem label="Phone">{phoneNumber || 'Not provided'}</ModerationDetailItem>
        <ModerationDetailItem label="Coordinates">
          {formatCoordinate(coords.lat)}, {formatCoordinate(coords.lon)}
        </ModerationDetailItem>
      </dl>

      <ModerationDetailItem label="Detailed address">{detailedAddress}</ModerationDetailItem>

      <ModerationDetailItem label="Website">
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
      </ModerationDetailItem>

      <ModerationDetailItem label="Description">
        <p className="whitespace-pre-wrap text-gray-700">{description}</p>
      </ModerationDetailItem>
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
        <ModerationDetailItem label="Submitted">
          <time dateTime={createdAt}>{formattedDate}</time>
        </ModerationDetailItem>
        <ModerationDetailItem label="Submitter">
          <ModerationSubmitter username={submitterUsername} userId={userId} />
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

export default VenueModerationDetail;
