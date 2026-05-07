import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonGroup, Input } from '@heroui/react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import LoaderSpinner from '@/ui/LoaderSpinner';
import PaginationControls, {
  PaginationControlsParams,
} from '@/ui/PaginationControls';
import { useModerationCities } from '../hooks/useModerationCities';
import { useModerationVenues } from '../hooks/useModerationVenues';
import {
  ModerationStatus,
  ModerationVenue,
  UniqueCity,
  VenueFilter,
} from '@/types/venueTypes';

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

function getCityKey(city: UniqueCity) {
  return `${city.city}|${city.country}`;
}

function formatSubmittedDate(createdAt: string) {
  return format(parseISO(createdAt), 'dd MMM yyyy');
}

function VenueModerationQueue() {
  const [status, setStatus] = useState<ModerationStatus>('pending');
  const [selectedCityKey, setSelectedCityKey] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [pagination, setPagination] =
    useState<PaginationControlsParams>(DEFAULT_PAGINATION);

  const { cities, isPending: isLoadingCities } = useModerationCities({
    status,
  });

  const selectedCity = useMemo(
    () => cities?.find((city) => getCityKey(city) === selectedCityKey),
    [cities, selectedCityKey]
  );

  const filters = useMemo(() => {
    const nextFilters: VenueFilter[] = [];

    if (selectedCity) {
      nextFilters.push({ field: 'city', value: selectedCity.city, method: 'eq' });
      nextFilters.push({
        field: 'country',
        value: selectedCity.country,
        method: 'eq',
      });
    }

    if (submittedSearch.trim()) {
      nextFilters.push({
        field: 'venueName',
        value: `%${submittedSearch.trim()}%`,
        method: 'ilike',
      });
    }

    return nextFilters;
  }, [selectedCity, submittedSearch]);

  const {
    error,
    isPending: isLoadingVenues,
    totalCount,
    venues,
  } = useModerationVenues({
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

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(searchValue);
    resetPagination();
  }

  function handleClearSearch() {
    setSearchValue('');
    setSubmittedSearch('');
    resetPagination();
  }

  function handlePageChange(pageNumber: number) {
    setPagination((current) => ({ ...current, pageNumber }));
  }

  return (
    <section aria-labelledby="venue-moderation-title">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 id="venue-moderation-title" className="text-2xl font-semibold">
            Venue moderation
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Review submitted venues by status, city, and venue name.
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

      <div className="mb-5 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-md lg:grid-cols-[minmax(14rem,18rem)_1fr]">
        <label className="flex flex-col gap-1 font-medium text-gray-700">
          City
          <select
            value={selectedCityKey}
            onChange={handleCityChange}
            className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm font-normal text-gray-800 shadow-sm outline-none transition focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200"
          >
            <option value="all">All cities</option>
            {cities?.map((city) => (
              <option key={getCityKey(city)} value={getCityKey(city)}>
                {city.city} - {city.country}
              </option>
            ))}
          </select>
        </label>

        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={handleSearchSubmit}
        >
          <Input
            label="Search"
            labelPlacement="outside"
            radius="full"
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search by venue name"
          />
          <ButtonGroup radius="full">
            <Button variant="flat" type="button" onPress={handleClearSearch}>
              Clear
            </Button>
            <Button color="primary" type="submit">
              Search
            </Button>
          </ButtonGroup>
        </form>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-danger-200 bg-white p-5 text-sm text-danger-700 shadow-md"
        >
          Venue moderation queue could not be loaded.
        </div>
      ) : null}

      {isLoadingVenues || isLoadingCities ? (
        <LoaderSpinner message="Loading venue submissions" />
      ) : null}

      {!isLoadingVenues && !error && venues?.length === 0 ? (
        <div
          role="status"
          className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm shadow-md"
        >
          <p className="text-lg font-semibold text-gray-700">
            No {status} venues found.
          </p>
        </div>
      ) : null}

      {!isLoadingVenues && venues && venues.length > 0 ? (
        <>
          <div className="mb-3 flex justify-center">
            <PaginationControls
              pagination={pagination}
              totalCount={totalCount}
              updatePageNumber={handlePageChange}
            />
          </div>

          <ul className="space-y-3">
            {venues.map((venue) => (
              <VenueModerationQueueItem key={venue.venueId} venue={venue} />
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

function VenueModerationQueueItem({ venue }: { venue: ModerationVenue }) {
  const {
    city,
    country,
    createdAt,
    status,
    submitterUsername,
    userId,
    venueId,
    venueName,
    venueType,
  } = venue;
  const formattedDate = formatSubmittedDate(createdAt);

  return (
    <li>
      <article className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-md transition hover:border-primary-200 hover:bg-primary-50/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                <Link
                  to={`/admin/moderation/venues/${venueId}`}
                  className="rounded-sm hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {venueName}
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

            <dl className="grid gap-2 text-gray-600 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-gray-800">Location</dt>
                <dd>
                  {city}, {country}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-800">Type</dt>
                <dd className="capitalize">{venueType}</dd>
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
                  {submitterUsername && (
                    <span className="mt-0.5 block break-all font-mono text-xs text-gray-500">
                      {userId}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <Button
            as={Link}
            to={`/admin/moderation/venues/${venueId}`}
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

export default VenueModerationQueue;
