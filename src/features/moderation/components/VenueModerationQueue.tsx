import { FormEvent, useMemo, useState } from 'react';
import { Button, ButtonGroup, Input } from '@heroui/react';
import LoaderSpinner from '@/ui/LoaderSpinner';
import PaginationControls, {
  PaginationControlsParams,
} from '@/ui/PaginationControls';
import { useModerationCities } from '../hooks/useModerationCities';
import { useModerationVenues } from '../hooks/useModerationVenues';
import { MODERATION_STATUSES, STATUS_LABELS } from '../constants';
import { formatSubmittedDate } from '../utils/formatSubmittedDate';
import ModerationCitySelect from './ModerationCitySelect';
import ModerationQueueRow from './ModerationQueueRow';
import ModerationSubmitter from './ModerationSubmitter';
import { getModerationCityKey } from './moderationCityKey';
import {
  ModerationStatus,
  ModerationVenue,
  VenueFilter,
} from '@/types/venueTypes';

const DEFAULT_PAGINATION = {
  pageNumber: 1,
  maxResults: 8,
} satisfies PaginationControlsParams;

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
    () =>
      cities?.find((city) => getModerationCityKey(city) === selectedCityKey),
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

  function handleCityChange(nextCityKey: string) {
    setSelectedCityKey(nextCityKey);
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
        <ModerationCitySelect
          cities={cities}
          value={selectedCityKey}
          onChange={handleCityChange}
        />

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
    <ModerationQueueRow
      detailHref={`/admin/moderation/venues/${venueId}`}
      status={status}
      title={venueName}
      metadata={
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
              <ModerationSubmitter username={submitterUsername} userId={userId} />
            </dd>
          </div>
        </dl>
      }
    />
  );
}

export default VenueModerationQueue;
