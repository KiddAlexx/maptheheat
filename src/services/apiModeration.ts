import camelcaseKeys from 'camelcase-keys';
import decamelize from 'decamelize';
import decamelizeKeys from 'decamelize-keys';
import { addImagePaths } from '@/utils/addImagePaths';
import {
  ModerationStatus,
  ModerationVenue,
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

export interface ModerationCitiesRequestParams {
  status?: ModerationStatus;
}

export interface UpdateModerationVenueArgs {
  venueId: string;
  venueUpdate: Partial<ModerationVenue>;
}

export interface UpdateVenueModerationStatusArgs {
  venueId: string;
  status: ModerationStatus;
}

export interface UpdateModerationImageStatusesArgs {
  approvedImageIds: string[];
  declinedImageIds: string[];
}

type ModerationVenueRow = ModerationVenue & {
  profiles?: {
    username: string | null;
  } | null;
};

function mapModerationVenue(row: ModerationVenueRow): ModerationVenue {
  const { profiles, ...venue } = row;

  return {
    ...venue,
    submitterUsername: profiles?.username ?? null,
  };
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

export async function getModerationCities({
  status = 'pending',
}: ModerationCitiesRequestParams = {}): Promise<UniqueCity[]> {
  if (status === 'pending') {
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

export async function updateVenueModerationStatus({
  venueId,
  status,
}: UpdateVenueModerationStatusArgs): Promise<void> {
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
