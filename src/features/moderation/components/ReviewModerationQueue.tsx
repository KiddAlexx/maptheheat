import { FormEvent, useMemo, useState } from 'react';
import { Button, ButtonGroup, Input } from '@heroui/react';
import LoaderSpinner from '@/ui/LoaderSpinner';
import PaginationControls, {
  PaginationControlsParams,
} from '@/ui/PaginationControls';
import { useModerationReviewCities } from '../hooks/useModerationReviewCities';
import { useModerationReviews } from '../hooks/useModerationReviews';
import { MODERATION_STATUSES, STATUS_LABELS } from '../constants';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import ModerationCitySelect from './ModerationCitySelect';
import ModerationQueueRow from './ModerationQueueRow';
import ModerationSubmitter from './ModerationSubmitter';
import { getModerationCityKey } from './moderationCityKey';
import {
  ModerationReview,
  ReviewModerationFilter,
} from '@/types/reviewTypes';
import { ModerationStatus } from '@/types/venueTypes';

const DEFAULT_PAGINATION = {
  pageNumber: 1,
  maxResults: 8,
} satisfies PaginationControlsParams;

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

  function handleCityChange(nextCityKey: string) {
    setSelectedCityKey(nextCityKey);
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
          <p className="mt-1 text-sm text-app-muted">
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
        className="mb-5 rounded-xl border border-app-border bg-app-card p-4 text-sm shadow-md"
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
          className="rounded-xl border border-danger-200 bg-app-card p-5 text-sm text-danger-700 shadow-md dark:border-danger-700 dark:text-danger-400"
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
          className="rounded-xl border border-app-border bg-app-card p-6 text-center text-sm shadow-md"
        >
          <p className="text-lg font-semibold">
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
    <ModerationQueueRow
      detailHref={`/admin/moderation/reviews/${reviewId}`}
      status={status}
      title={reviewTitle}
      metadata={
        <dl className="grid gap-2 text-app-muted sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="font-medium text-foreground">Venue</dt>
            <dd>
              {venueName}
              {city && country ? (
                <span className="mt-0.5 block text-xs text-app-muted">
                  {city}, {country}
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Ratings</dt>
            <dd>
              Heat {heatRating} / Quality {qualityRating}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Submitted</dt>
            <dd>
              <time dateTime={createdAt}>{formattedDate}</time>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Submitter</dt>
            <dd>
              <ModerationSubmitter username={submitterUsername} userId={userId} />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Review ID</dt>
            <dd className="break-all font-mono text-xs">{reviewId}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Venue ID</dt>
            <dd className="break-all font-mono text-xs">{venueId}</dd>
          </div>
        </dl>
      }
    />
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
