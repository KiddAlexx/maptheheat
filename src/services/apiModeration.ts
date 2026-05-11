import camelcaseKeys from 'camelcase-keys';
import decamelize from 'decamelize';
import decamelizeKeys from 'decamelize-keys';
import { addImagePaths } from '@/utils/addImagePaths';
import {
  ModerationReview,
  ReviewModerationFilter,
  ReviewPagination,
  ReviewSort,
} from '@/types/reviewTypes';
import {
  AdminNotificationPayload,
  ModerationNotificationRecipient,
  UserNotification,
} from '@/types/userTypes';
import {
  DetailedImage,
  ImageUploadParams,
  ModerationImage,
  ModerationStatus,
  ModerationStandaloneImageGroup,
  ModerationVenue,
  StandaloneImageModerationFilter,
  UniqueCity,
  UniqueUserCity,
  VenueFilter,
  VenuePagination,
  VenueSort,
} from '@/types/venueTypes';
import supabase from './supabase';

export interface ModerationVenuesRequestParams {
  status?: ModerationStatus;
  filters?: VenueFilter[];
  sort?: VenueSort | null;
  pagination?: VenuePagination;
}

export interface ModerationVenuesResponse {
  data: ModerationVenue[];
  count: number | null;
}

export type ModerationCityScope = 'venue' | 'review';

export interface ModerationCitiesRequestParams {
  scope?: ModerationCityScope;
  status?: ModerationStatus;
}

export interface ModerationReviewsRequestParams {
  status?: ModerationStatus;
  filters?: ReviewModerationFilter[];
  sort?: ReviewSort | null;
  pagination?: ReviewPagination;
}

export interface ModerationReviewsResponse {
  data: ModerationReview[];
  count: number | null;
}

// No `sort` field — the standalone grouping view is always ordered by
// last_created_at (most recent first) since it has no other meaningful sort
// dimension. Add a sort field here only if a caller needs alternate ordering.
export interface ModerationStandaloneImagesRequestParams {
  status?: ModerationStatus;
  filters?: StandaloneImageModerationFilter[];
  pagination?: VenuePagination;
}

export interface ModerationStandaloneImagesResponse {
  data: ModerationStandaloneImageGroup[];
  count: number | null;
}

export interface UpdateModerationVenueArgs {
  venueId: string;
  venueUpdate: Partial<ModerationVenue>;
}

export interface UpdateModerationReviewArgs {
  reviewId: string;
  reviewUpdate: Partial<ModerationReview>;
}

export interface UpdateModerationVenueStatusArgs {
  venueId: string;
  status: ModerationStatus;
}

export interface UpdateModerationReviewStatusArgs {
  reviewId: string;
  status: ModerationStatus;
}

export interface UpdateModerationImageStatusesArgs {
  approvedImageIds: string[];
  declinedImageIds: string[];
}

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

type ModerationVenueRow = ModerationVenue & {
  profiles?: {
    username: string | null;
  } | null;
};

type ModerationReviewRow = Omit<ModerationReview, 'venueDetails'> & {
  profiles?: {
    username: string | null;
  } | null;
  venueDetails?: ModerationReview['venueDetails'] | ModerationReview['venueDetails'][];
};

type ModerationReviewCityRow = {
  venueDetails?:
    | Omit<UniqueCity, 'cityId'>
    | Omit<UniqueCity, 'cityId'>[]
    | null;
};

type ModerationStandaloneImageRow = DetailedImage &
  Partial<Pick<ModerationImage, 'createdAt' | 'reviewId' | 'userId' | 'venueId'>> & {
    imageType?: ImageUploadParams['imageType'] | string | null;
    status?: ModerationStatus;
  };

type ModerationStandaloneImageGroupRow = Omit<
  ModerationStandaloneImageGroup,
  'groupId' | 'images'
> & {
  images?: ModerationStandaloneImageRow[] | null;
};

type StandaloneImageVenueRow = Pick<
  ModerationStandaloneImageGroup,
  'city' | 'country' | 'venueId' | 'venueName' | 'venueNameSlug'
>;

function mapModerationVenue(row: ModerationVenueRow): ModerationVenue {
  const { profiles, ...venue } = row;

  return {
    ...venue,
    submitterUsername: profiles?.username ?? null,
  };
}

function mapModerationReview(row: ModerationReviewRow): ModerationReview {
  const { profiles, venueDetails, ...review } = row;
  const normalizedVenueDetails = Array.isArray(venueDetails)
    ? venueDetails[0] ?? null
    : venueDetails ?? null;

  return {
    ...review,
    submitterUsername: profiles?.username ?? null,
    venueDetails: normalizedVenueDetails,
    venueImages: addImagePaths(review.venueImages),
  };
}

function getStandaloneImageGroupId({
  userId,
  venueId,
}: {
  userId: string;
  venueId: string;
}): string {
  return `${venueId}:${userId}`;
}

function mapStandaloneImage(
  image: ModerationStandaloneImageRow,
  group: Pick<ModerationStandaloneImageGroupRow, 'userId' | 'venueId'>
): ModerationImage {
  const imageType =
    image.imageType === 'venue' ||
    image.imageType === 'review' ||
    image.imageType === 'standalone'
      ? image.imageType
      : null;

  return {
    ...image,
    altText: image.altText ?? 'Submitted standalone image',
    createdAt: image.createdAt ?? '',
    imageType,
    reviewId: image.reviewId ?? null,
    status: image.status ?? 'pending',
    userId: image.userId ?? group.userId,
    venueId: image.venueId ?? group.venueId,
  };
}

function mapStandaloneImageGroup(
  row: ModerationStandaloneImageGroupRow
): ModerationStandaloneImageGroup {
  const images = row.images?.map((image) => mapStandaloneImage(image, row));

  return {
    ...row,
    groupId: getStandaloneImageGroupId(row),
    images: addImagePaths(images),
  };
}

async function fillStandaloneImageVenueDetails(
  groups: ModerationStandaloneImageGroup[]
): Promise<ModerationStandaloneImageGroup[]> {
  const groupsMissingVenueDetails = groups.filter(
    (group) =>
      !group.city || !group.country || !group.venueName || !group.venueNameSlug
  );

  if (groupsMissingVenueDetails.length === 0) return groups;

  const venueIds = [
    ...new Set(groupsMissingVenueDetails.map((group) => group.venueId)),
  ];
  const { data, error } = await supabase
    .from('venue_details')
    .select('venue_id, venue_name, city, country, venue_name_slug')
    .in('venue_id', venueIds);

  if (error) {
    throw new Error(
      `Standalone image venue details could not be loaded. Error: ${error.message}`
    );
  }

  const venueDetailsById = new Map(
    (camelcaseKeys(data, { deep: true }) as StandaloneImageVenueRow[]).map(
      (venue) => [venue.venueId, venue]
    )
  );

  return groups.map((group) => {
    const venueDetails = venueDetailsById.get(group.venueId);

    if (!venueDetails) return group;

    return {
      ...group,
      city: group.city ?? venueDetails.city,
      country: group.country ?? venueDetails.country,
      venueName: group.venueName ?? venueDetails.venueName,
      venueNameSlug: group.venueNameSlug ?? venueDetails.venueNameSlug,
    };
  });
}

export async function getIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');

  if (error) {
    throw new Error(
      `Admin access could not be verified. Error: ${error.message}`
    );
  }

  return Boolean(data);
}

export async function searchModerationNotificationRecipients(
  query: string
): Promise<ModerationNotificationRecipient[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return [];

  let request = supabase
    .from('profiles')
    .select('user_id, username')
    .order('username', { ascending: true })
    .limit(10);

  if (UUID_PATTERN.test(trimmedQuery)) {
    request = request.eq('user_id', trimmedQuery);
  } else {
    request = request.ilike('username', `%${trimmedQuery}%`);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(
      `Notification recipients could not be searched. Error: ${error.message}`
    );
  }

  return camelcaseKeys(data, { deep: true }) as ModerationNotificationRecipient[];
}

export async function insertModerationNotification(
  payload: AdminNotificationPayload
): Promise<UserNotification> {
  const { data, error } = await supabase.rpc('admin_insert_notification', {
    p: decamelizeKeys(payload),
  });

  if (error) {
    throw new Error(
      `Notification could not be sent. Error: ${error.message}`
    );
  }

  return camelcaseKeys(data, { deep: true }) as UserNotification;
}

export async function getModerationVenues({
  status = 'pending',
  filters = [],
  sort,
  pagination,
}: ModerationVenuesRequestParams = {}): Promise<ModerationVenuesResponse> {
  let query = supabase
    .from('venue_details')
    .select('*, profiles(username)', { count: 'exact' })
    .eq('status', status);

  if (filters.length > 0) {
    filters.forEach((filter) => {
      const convertedField = decamelize(filter.field);
      // @ts-expect-error: Dynamic method call is constrained by VenueFilter.method.
      query = query[filter.method](convertedField, filter.value);
    });
  }

  if (sort) {
    const convertedSortField = decamelize(sort.field);
    query = query.order(convertedSortField, {
      ascending: sort.direction === 'asc',
    });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (pagination) {
    const { pageNumber, maxResults } = pagination;
    const from = (pageNumber - 1) * maxResults;
    const to = from + maxResults - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(
      `Moderation venues could not be loaded. Error: ${error.message}`
    );
  }

  const venues = camelcaseKeys(data, { deep: true }) as ModerationVenueRow[];

  return { data: venues.map(mapModerationVenue), count };
}

export async function getModerationVenue(
  venueId: string
): Promise<ModerationVenue> {
  const { data, error } = await supabase
    .from('venue_details')
    .select(
      '*, profiles(username), venue_images(image_id, created_at, venue_id, review_id, user_id, alt_text, status, image_type, image_path)'
    )
    .eq('venue_id', venueId)
    .single();

  if (error) {
    throw new Error(
      `Moderation venue could not be loaded. Error: ${error.message}`
    );
  }

  const venueData = mapModerationVenue(
    camelcaseKeys(data, { deep: true }) as ModerationVenueRow
  );

  return {
    ...venueData,
    venueImages: addImagePaths(venueData.venueImages),
  };
}

export async function getModerationReviews({
  status = 'pending',
  filters = [],
  sort,
  pagination,
}: ModerationReviewsRequestParams = {}): Promise<ModerationReviewsResponse> {
  let query = supabase
    .from('venue_reviews')
    .select(
      '*, profiles!inner(username), venue_details!inner(*), venue_images(image_id, created_at, venue_id, review_id, user_id, alt_text, status, image_type, image_path)',
      { count: 'exact' }
    )
    .eq('status', status);

  if (filters.length > 0) {
    filters.forEach((filter) => {
      const convertedField = decamelize(filter.field);
      // @ts-expect-error: Dynamic method call is constrained by ReviewModerationFilter.method.
      query = query[filter.method](convertedField, filter.value);
    });
  }

  if (sort) {
    const convertedSortField = decamelize(sort.field);
    query = query.order(convertedSortField, {
      ascending: sort.direction === 'asc',
    });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (pagination) {
    const { pageNumber, maxResults } = pagination;
    const from = (pageNumber - 1) * maxResults;
    const to = from + maxResults - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(
      `Moderation reviews could not be loaded. Error: ${error.message}`
    );
  }

  const reviews = camelcaseKeys(data, { deep: true }) as ModerationReviewRow[];

  return { data: reviews.map(mapModerationReview), count };
}

export async function getModerationReview(
  reviewId: string
): Promise<ModerationReview> {
  const { data, error } = await supabase
    .from('venue_reviews')
    .select(
      '*, profiles!inner(username), venue_details!inner(*), venue_images(image_id, created_at, venue_id, review_id, user_id, alt_text, status, image_type, image_path)'
    )
    .eq('review_id', reviewId)
    .single();

  if (error) {
    throw new Error(
      `Moderation review could not be loaded. Error: ${error.message}`
    );
  }

  return mapModerationReview(
    camelcaseKeys(data, { deep: true }) as ModerationReviewRow
  );
}

export async function getModerationStandaloneImages({
  status = 'pending',
  filters = [],
  pagination,
}: ModerationStandaloneImagesRequestParams = {}): Promise<ModerationStandaloneImagesResponse> {
  let query = supabase
    .from('pending_standalone_image_groups')
    .select('*', { count: 'exact' })
    .order('last_created_at', { ascending: false });

  if (filters.length > 0) {
    filters.forEach((filter) => {
      const convertedField = decamelize(filter.field);
      // @ts-expect-error: Dynamic method call is constrained by StandaloneImageModerationFilter.method.
      query = query[filter.method](convertedField, filter.value);
    });
  }

  if (pagination) {
    const { pageNumber, maxResults } = pagination;
    const from = (pageNumber - 1) * maxResults;
    const to = from + maxResults - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(
      `Standalone image moderation groups could not be loaded. Error: ${error.message}`
    );
  }

  const groups = (
    camelcaseKeys(data, { deep: true }) as ModerationStandaloneImageGroupRow[]
  ).map(mapStandaloneImageGroup);
  const groupsMatchingStatus = groups.filter((group) =>
    group.images.some((image) => image.status === status)
  );
  const groupsWithVenueDetails =
    await fillStandaloneImageVenueDetails(groupsMatchingStatus);

  return {
    data: groupsWithVenueDetails,
    count: status === 'pending' ? count : groupsWithVenueDetails.length,
  };
}

export async function getModerationStandaloneImageGroup(
  groupId: string
): Promise<ModerationStandaloneImageGroup> {
  const { data } = await getModerationStandaloneImages();
  const group = data.find((imageGroup) => imageGroup.groupId === groupId);

  if (!group) {
    throw new Error('Standalone image moderation group could not be found.');
  }

  return group;
}

export async function getModerationCities({
  scope = 'venue',
  status = 'pending',
}: ModerationCitiesRequestParams = {}): Promise<UniqueCity[]> {
  if (scope === 'review' && status === 'pending') {
    return getPendingReviewCities();
  }

  if (status === 'pending') {
    return getPendingVenueCities();
  }

  return getVenueCitiesByStatus(status);
}

async function getPendingVenueCities(): Promise<UniqueCity[]> {
  const { data, error } = await supabase.rpc('get_pending_cities');

  if (error) {
    throw new Error(
      `Pending moderation cities could not be loaded. Error: ${error.message}`
    );
  }

  return data.map((cityObj: UniqueUserCity, index: number) => ({
    cityId: String(index + 1),
    ...cityObj,
  }));
}

async function getVenueCitiesByStatus(
  status: ModerationStatus
): Promise<UniqueCity[]> {
  const { data, error } = await supabase
    .from('venue_details')
    .select('coords, country, city')
    .eq('status', status)
    .order('city', { ascending: true });

  if (error) {
    throw new Error(
      `Moderation cities could not be loaded. Error: ${error.message}`
    );
  }

  const uniqueCities = new Map<string, UniqueCity>();

  camelcaseKeys(data).forEach((cityObj, index) => {
    const city = cityObj as Omit<UniqueCity, 'cityId'>;
    const key = `${city.city}|${city.country}`;

    if (!uniqueCities.has(key)) {
      uniqueCities.set(key, {
        cityId: String(index + 1),
        ...city,
      });
    }
  });

  return [...uniqueCities.values()];
}

async function getPendingReviewCities(): Promise<UniqueCity[]> {
  const { data, error } = await supabase
    .from('venue_reviews')
    .select('venue_details(coords, country, city)')
    .eq('status', 'pending');

  if (error) {
    throw new Error(
      `Review moderation cities could not be loaded. Error: ${error.message}`
    );
  }

  const uniqueCities = new Map<string, UniqueCity>();
  const rows = camelcaseKeys(data, { deep: true }) as ModerationReviewCityRow[];

  rows.forEach((row) => {
    const city = Array.isArray(row.venueDetails)
      ? row.venueDetails[0]
      : row.venueDetails;

    if (!city) return;

    const key = `${city.city}|${city.country}`;

    if (!uniqueCities.has(key)) {
      uniqueCities.set(key, {
        cityId: String(uniqueCities.size + 1),
        ...city,
      });
    }
  });

  return [...uniqueCities.values()].sort((firstCity, secondCity) =>
    firstCity.city.localeCompare(secondCity.city)
  );
}

export async function updateModerationVenueStatus({
  venueId,
  status,
}: UpdateModerationVenueStatusArgs): Promise<void> {
  const { error } = await supabase
    .from('venue_details')
    .update({ status })
    .eq('venue_id', venueId);

  if (error) {
    throw new Error(
      `Venue moderation status could not be updated. Error: ${error.message}`
    );
  }
}

export async function updateModerationReviewStatus({
  reviewId,
  status,
}: UpdateModerationReviewStatusArgs): Promise<void> {
  const { error } = await supabase
    .from('venue_reviews')
    .update({ status })
    .eq('review_id', reviewId);

  if (error) {
    throw new Error(
      `Review moderation status could not be updated. Error: ${error.message}`
    );
  }
}

export async function updateModerationVenue({
  venueId,
  venueUpdate,
}: UpdateModerationVenueArgs): Promise<ModerationVenue> {
  const convertedVenue = decamelizeKeys(venueUpdate);

  const { data, error } = await supabase
    .from('venue_details')
    .update(convertedVenue)
    .eq('venue_id', venueId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Moderation venue could not be updated. Error: ${error.message}`
    );
  }

  return camelcaseKeys(data, { deep: true }) as ModerationVenue;
}

export async function updateModerationReview({
  reviewId,
  reviewUpdate,
}: UpdateModerationReviewArgs): Promise<ModerationReview> {
  const convertedReview = decamelizeKeys(reviewUpdate);

  const { data, error } = await supabase
    .from('venue_reviews')
    .update(convertedReview)
    .eq('review_id', reviewId)
    .select(
      '*, profiles!inner(username), venue_details!inner(*), venue_images(image_id, created_at, venue_id, review_id, user_id, alt_text, status, image_type, image_path)'
    )
    .single();

  if (error) {
    throw new Error(
      `Moderation review could not be updated. Error: ${error.message}`
    );
  }

  return mapModerationReview(
    camelcaseKeys(data, { deep: true }) as ModerationReviewRow
  );
}

export async function updateModerationImageStatuses({
  approvedImageIds,
  declinedImageIds,
}: UpdateModerationImageStatusesArgs): Promise<void> {
  const updates = [
    { imageIds: approvedImageIds, status: 'approved' },
    { imageIds: declinedImageIds, status: 'declined' },
  ] as const;

  await Promise.all(
    updates.map(async ({ imageIds, status }) => {
      if (imageIds.length === 0) return;

      const { error } = await supabase
        .from('venue_images')
        .update({ status })
        .in('image_id', imageIds);

      if (error) {
        throw new Error(
          `Image moderation statuses could not be updated. Error: ${error.message}`
        );
      }
    })
  );
}
