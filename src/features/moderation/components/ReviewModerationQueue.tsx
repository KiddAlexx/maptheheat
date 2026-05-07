import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonGroup, Input } from '@heroui/react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import LoaderSpinner from '@/ui/LoaderSpinner';
import PaginationControls, {
  PaginationControlsParams,
} from '@/ui/PaginationControls';
import { useModerationReviewCities } from '../hooks/useModerationReviewCities';
import { useModerationReviews } from '../hooks/useModerationReviews';
import ModerationCitySelect from './ModerationCitySelect';
import { getModerationCityKey } from './moderationCityKey';
import {
  ModerationReview,
  ReviewModerationFilter,
} from '@/types/reviewTypes';
import { ModerationStatus } from '@/types/venueTypes';

const MODERATION_STATUSES: ModerationStatus[] = [
  'pending',
  'approved',
  'declined',
];

const DEFAULT_PAGINATION = {
  pageNumber: 1,
  maxResults: 8,
} satisfies PaginationControlsParams;

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

interface ReviewSearchValues {
  reviewText: string;
  username: string;
  venueName: string;
}

const EMPTY_SEARCH_VALUES: ReviewSearchValues = {
  reviewText: '',
  username: '',
  venueName: '',
};

function formatSubmittedDate(createdAt: string) {
  return format(parseISO(createdAt), 'dd MMM yyyy');
}

function ReviewModerationQueue() {
  const [status, setStatus] = useState<ModerationStatus>('pending');
  const [searchValues, setSearchValues] =
    useState<ReviewSearchValues>(EMPTY_SEARCH_VALUES);
  const [submittedSearch, setSubmittedSearch] =
    useState<ReviewSearchValues>(EMPTY_SEARCH_VALUES);
  const [selectedCityKey, setSelectedCityKey] = useState('all');
  const [pagination, setPagination] =
    useState<PaginationControlsParams>(DEFAULT_PAGINATION);

  const { cities, isPending: isLoadingCities } = useModerationReviewCities({
    status,
  });

  const selectedCity = useMemo(
    () =>
      cities?.find((city) => getModerationCityKey(city) === selectedCityKey),
    [cities, selectedCityKey]
  );
  const selectedCityLabel = selectedCity
    ? ` for ${selectedCity.city}, ${selectedCity.country}`
    : '';

  const filters = useMemo(
    () => buildReviewFilters(submittedSearch, selectedCity),
    [selectedCity, submittedSearch]
  );

  const {
    error,
    isPending: isLoadingReviews,
    reviews,
    totalCount,
  } = useModerationReviews({
    status,
    filters,
    pagination,
  });

  function resetPagination() {
    setPagination((current) => ({ ...current, pageNumber: 1 }));
  }

  function handleStatusChange(nextStatus: ModerationStatus) {
    setStatus(nextStatus);
    setSelectedCityKey('all');
    resetPagination();
  }

  function handleCityChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedCityKey(event.target.value);
    resetPagination();
  }

  function handleSearchValueChange(
    field: keyof ReviewSearchValues,
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
    setSelectedCityKey('all');
    resetPagination();
  }

  function handlePageChange(pageNumber: number) {
    setPagination((current) => ({ ...current, pageNumber }));
  }

  return (
    <section aria-labelledby="review-moderation-title">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="review-moderation-title" className="text-2xl font-semibold">
            Review moderation
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Review submitted ratings and comments by status, venue, city, or
            submitter.
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
          <ModerationCitySelect
            cities={cities}
            value={selectedCityKey}
            onChange={handleCityChange}
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
          <Input
            label="Review text"
            labelPlacement="outside"
            radius="full"
            value={searchValues.reviewText}
            onValueChange={(value) =>
              handleSearchValueChange('reviewText', value)
            }
            placeholder="Search title or content"
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
          Review moderation queue could not be loaded.
        </div>
      ) : null}

      {isLoadingReviews ? (
        <LoaderSpinner message="Loading review submissions" />
      ) : null}

      {isLoadingCities ? (
        <LoaderSpinner message="Loading review moderation cities" />
      ) : null}

      {!isLoadingReviews && !error && reviews?.length === 0 ? (
        <div
          role="status"
          className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm shadow-md"
        >
          <p className="text-lg font-semibold text-gray-700">
            No {status} reviews found{selectedCityLabel}.
          </p>
        </div>
      ) : null}

      {!isLoadingReviews && reviews && reviews.length > 0 ? (
        <>
          <div className="mb-3 flex justify-center">
            <PaginationControls
              pagination={pagination}
              totalCount={totalCount}
              updatePageNumber={handlePageChange}
            />
          </div>

          <ul className="space-y-3">
            {reviews.map((review) => (
              <ReviewModerationQueueItem
                key={review.reviewId}
                review={review}
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

function ReviewModerationQueueItem({
  review,
}: {
  review: ModerationReview;
}) {
  const {
    createdAt,
    heatRating,
    qualityRating,
    reviewId,
    reviewTitle,
    status,
    submitterUsername,
    userId,
    venueDetails,
    venueId,
  } = review;
  const formattedDate = formatSubmittedDate(createdAt);
  const venueName = venueDetails?.venueName ?? 'Unknown venue';
  const city = venueDetails?.city;
  const country = venueDetails?.country;

  return (
    <li>
      <article className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-md transition hover:border-primary-200 hover:bg-primary-50/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                <Link
                  to={`/admin/moderation/reviews/${reviewId}`}
                  className="rounded-sm hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {reviewTitle}
                </Link>
              </h3>
              <span
                className={clsx(
                  'rounded-full border px-2.5 py-1 text-xs font-semibold',
                  STATUS_BADGE_CLASSES[status]
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>

            <dl className="grid gap-2 text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="font-medium text-gray-800">Venue</dt>
                <dd>
                  {venueName}
                  {city && country ? (
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {city}, {country}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-800">Ratings</dt>
                <dd>
                  Heat {heatRating} / Quality {qualityRating}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-800">Submitted</dt>
                <dd>
                  <time dateTime={createdAt}>{formattedDate}</time>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-800">Submitter</dt>
                <dd>
                  <span>{submitterUsername || userId}</span>
                  {submitterUsername ? (
                    <span className="mt-0.5 block break-all font-mono text-xs text-gray-500">
                      {userId}
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-800">Review ID</dt>
                <dd className="break-all font-mono text-xs">{reviewId}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-800">Venue ID</dt>
                <dd className="break-all font-mono text-xs">{venueId}</dd>
              </div>
            </dl>
          </div>

          <Button
            as={Link}
            to={`/admin/moderation/reviews/${reviewId}`}
            radius="full"
            color="primary"
            variant="flat"
            className="shrink-0"
          >
            Review
          </Button>
        </div>
      </article>
    </li>
  );
}

function buildReviewFilters(
  { reviewText, username, venueName }: ReviewSearchValues,
  selectedCity?: { city: string; country: string } | null
): ReviewModerationFilter[] {
  const filters: ReviewModerationFilter[] = [];

  if (venueName.trim()) {
    filters.push({
      field: 'venueDetails.venueName',
      value: `%${venueName.trim()}%`,
      method: 'ilike',
    });
  }

  if (selectedCity) {
    filters.push({
      field: 'venueDetails.city',
      value: selectedCity.city,
      method: 'eq',
    });
    filters.push({
      field: 'venueDetails.country',
      value: selectedCity.country,
      method: 'eq',
    });
  }

  if (username.trim()) {
    filters.push({
      field: 'profiles.username',
      value: `%${username.trim()}%`,
      method: 'ilike',
    });
  }

  if (reviewText.trim()) {
    filters.push({
      field: 'reviewContent',
      value: `%${reviewText.trim()}%`,
      method: 'ilike',
    });
  }

  return filters;
}

export default ReviewModerationQueue;
