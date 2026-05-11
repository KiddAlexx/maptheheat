import { FormEvent, useMemo, useState } from 'react';
import { Button, ButtonGroup, Image, Input } from '@heroui/react';
import LoaderSpinner from '@/ui/LoaderSpinner';
import PaginationControls, {
  PaginationControlsParams,
} from '@/ui/PaginationControls';
import { useModerationStandaloneImages } from '../hooks/useModerationStandaloneImages';
import { MODERATION_STATUSES, STATUS_LABELS } from '../constants';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import ModerationQueueRow from './ModerationQueueRow';
import ModerationSubmitter from './ModerationSubmitter';
import {
  ModerationImage,
  ModerationStandaloneImageGroup,
  ModerationStatus,
  StandaloneImageModerationFilter,
} from '@/types/venueTypes';

const DEFAULT_PAGINATION = {
  pageNumber: 1,
  maxResults: 8,
} satisfies PaginationControlsParams;

interface StandaloneImageSearchValues {
  username: string;
  venueName: string;
}

const EMPTY_SEARCH_VALUES: StandaloneImageSearchValues = {
  username: '',
  venueName: '',
};

function StandaloneImageModerationQueue() {
  const [status, setStatus] = useState<ModerationStatus>('pending');
  const [searchValues, setSearchValues] =
    useState<StandaloneImageSearchValues>(EMPTY_SEARCH_VALUES);
  const [submittedSearch, setSubmittedSearch] =
    useState<StandaloneImageSearchValues>(EMPTY_SEARCH_VALUES);
  const [pagination, setPagination] =
    useState<PaginationControlsParams>(DEFAULT_PAGINATION);

  const filters = useMemo(
    () => buildStandaloneImageFilters(submittedSearch),
    [submittedSearch]
  );

  const {
    error,
    imageGroups,
    isPending: isLoadingImageGroups,
    totalCount,
  } = useModerationStandaloneImages({
    status,
    filters,
    pagination,
  });

  function resetPagination() {
    setPagination((current) => ({ ...current, pageNumber: 1 }));
  }

  function handleStatusChange(nextStatus: ModerationStatus) {
    setStatus(nextStatus);
    resetPagination();
  }

  function handleSearchValueChange(
    field: keyof StandaloneImageSearchValues,
    value: string
  ) {
    setSearchValues((current) => ({ ...current, [field]: value }));
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(searchValues);
    resetPagination();
  }

  function handleClearSearch() {
    setSearchValues(EMPTY_SEARCH_VALUES);
    setSubmittedSearch(EMPTY_SEARCH_VALUES);
    resetPagination();
  }

  function handlePageChange(pageNumber: number) {
    setPagination((current) => ({ ...current, pageNumber }));
  }

  return (
    <section aria-labelledby="image-moderation-title">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="image-moderation-title" className="text-2xl font-semibold">
            Image moderation
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Review standalone image groups by status, venue, or submitter.
          </p>
        </div>

        <ButtonGroup radius="full" size="md">
          {MODERATION_STATUSES.map((moderationStatus) => (
            <Button
              key={moderationStatus}
              color={status === moderationStatus ? 'primary' : 'default'}
              aria-pressed={status === moderationStatus}
              onPress={() => handleStatusChange(moderationStatus)}
            >
              {STATUS_LABELS[moderationStatus]}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <form
        className="mb-5 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-md"
        onSubmit={handleSearchSubmit}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Venue"
            labelPlacement="outside"
            radius="full"
            value={searchValues.venueName}
            onValueChange={(value) =>
              handleSearchValueChange('venueName', value)
            }
            placeholder="Search by venue"
          />
          <Input
            label="Submitter"
            labelPlacement="outside"
            radius="full"
            value={searchValues.username}
            onValueChange={(value) =>
              handleSearchValueChange('username', value)
            }
            placeholder="Search by username"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <ButtonGroup radius="full">
            <Button variant="flat" type="button" onPress={handleClearSearch}>
              Clear
            </Button>
            <Button color="primary" type="submit">
              Search
            </Button>
          </ButtonGroup>
        </div>
      </form>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-danger-200 bg-white p-5 text-sm text-danger-700 shadow-md"
        >
          Image moderation queue could not be loaded.
        </div>
      ) : null}

      {isLoadingImageGroups ? (
        <LoaderSpinner message="Loading standalone image groups" />
      ) : null}

      {!isLoadingImageGroups && !error && imageGroups?.length === 0 ? (
        <div
          role="status"
          className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm shadow-md"
        >
          <p className="text-lg font-semibold text-gray-700">
            No {status} standalone image groups found.
          </p>
        </div>
      ) : null}

      {!isLoadingImageGroups && imageGroups && imageGroups.length > 0 ? (
        <>
          <div className="mb-3 flex justify-center">
            <PaginationControls
              pagination={pagination}
              totalCount={totalCount}
              updatePageNumber={handlePageChange}
            />
          </div>

          <ul className="space-y-3">
            {imageGroups.map((imageGroup) => (
              <StandaloneImageModerationQueueItem
                key={imageGroup.groupId}
                imageGroup={imageGroup}
                status={status}
              />
            ))}
          </ul>

          <div className="mt-3 flex justify-center">
            <PaginationControls
              pagination={pagination}
              totalCount={totalCount}
              updatePageNumber={handlePageChange}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}

function StandaloneImageModerationQueueItem({
  imageGroup,
  status,
}: {
  imageGroup: ModerationStandaloneImageGroup;
  status: ModerationStatus;
}) {
  const {
    city,
    groupId,
    imageCount,
    images,
    lastCreatedAt,
    userId,
    username,
    venueId,
    venueName,
  } = imageGroup;
  const formattedDate = formatSubmittedDate(lastCreatedAt);
  const title = venueName ?? 'Standalone image group';
  const imagesMatchingStatus = images.filter((image) => image.status === status);

  return (
    <ModerationQueueRow
      actionLabel="Review group"
      detailHref={`/admin/moderation/images/${encodeURIComponent(groupId)}`}
      status={status}
      title={title}
      metadata={
        <div className="grid gap-3 text-gray-600 md:grid-cols-[auto_1fr]">
          <StandaloneImagePreviewCluster images={images} />

          <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="font-medium text-gray-800">Images</dt>
              <dd>
                {imagesMatchingStatus.length}{' '}
                {STATUS_LABELS[status].toLowerCase()} of {imageCount}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-800">Venue</dt>
              <dd>
                {venueName ?? 'Unknown venue'}
                {city ? (
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {city}
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-800">Submitted</dt>
              <dd>
                <time dateTime={lastCreatedAt}>{formattedDate}</time>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-800">Submitter</dt>
              <dd>
                <ModerationSubmitter username={username} userId={userId} />
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-800">Group ID</dt>
              <dd className="break-all font-mono text-xs">{groupId}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-800">Venue ID</dt>
              <dd className="break-all font-mono text-xs">{venueId}</dd>
            </div>
          </dl>
        </div>
      }
    />
  );
}

function StandaloneImagePreviewCluster({
  images,
}: {
  images: ModerationImage[];
}) {
  return (
    <div
      aria-label="Image previews"
      className="grid h-20 w-28 shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-1"
      role="img"
    >
      {images.slice(0, 3).map((image, index) => (
        <Image
          key={image.imageId}
          alt={image.altText}
          className="h-full w-full object-cover"
          classNames={{
            wrapper: index === 0 ? 'row-span-2 h-full' : 'h-full',
          }}
          radius="sm"
          removeWrapper={false}
          src={image.imagePath.sm}
        />
      ))}
    </div>
  );
}

function buildStandaloneImageFilters({
  username,
  venueName,
}: StandaloneImageSearchValues): StandaloneImageModerationFilter[] {
  const filters: StandaloneImageModerationFilter[] = [];

  if (venueName.trim()) {
    filters.push({
      field: 'venueName',
      value: `%${venueName.trim()}%`,
      method: 'ilike',
    });
  }

  if (username.trim()) {
    filters.push({
      field: 'username',
      value: `%${username.trim()}%`,
      method: 'ilike',
    });
  }

  return filters;
}

export default StandaloneImageModerationQueue;
