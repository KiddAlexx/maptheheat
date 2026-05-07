import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/apiModeration');

const {
  getModerationReview,
  getModerationReviews,
  getModerationStandaloneImageGroup,
  getModerationStandaloneImages,
  updateModerationImageStatuses,
} = await vi.importActual<
  typeof import('@/services/apiModeration')
>('@/services/apiModeration');

type QueryMethod = ReturnType<typeof vi.fn>;

interface SupabaseQueryMock {
  count: number | null;
  data: unknown;
  error: null;
  eq: QueryMethod;
  filter: QueryMethod;
  from: QueryMethod;
  in: QueryMethod;
  insert: QueryMethod;
  order: QueryMethod;
  range: QueryMethod;
  select: QueryMethod;
  single: QueryMethod;
  update: QueryMethod;
}

const supabaseMocks = vi.hoisted(() => {
  const state: { query?: unknown } = {};

  return {
    from: vi.fn(() => state.query),
    state,
  };
});

vi.mock('@/services/supabase', () => ({
  supabaseUrl: 'https://example.supabase.co',
  default: {
    from: supabaseMocks.from,
  },
}));

function createSupabaseQueryMock({
  count = null,
  data,
}: {
  count?: number | null;
  data: unknown;
}): SupabaseQueryMock {
  const query: SupabaseQueryMock = {
    count,
    data,
    error: null,
    eq: vi.fn(() => query),
    filter: vi.fn(() => query),
    from: vi.fn(() => query),
    in: vi.fn(() => query),
    insert: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
    select: vi.fn(() => query),
    single: vi.fn(() => query),
    update: vi.fn(() => query),
  };

  return query;
}

const moderationReviewRow = {
  review_id: 'review-test-id',
  review_title: 'Big heat',
  review_content: 'Hot and tasty',
  review_type: 'restaurant',
  heat_rating: 4,
  quality_rating: 5,
  status: 'pending',
  user_id: 'submitter-user-id',
  venue_id: 'venue-test-id',
  created_at: '2026-05-01T10:00:00.000Z',
  profiles: { username: 'pepper_admin' },
  venue_details: [
    {
      venue_id: 'venue-test-id',
      venue_name: 'Pepper Palace',
      city: 'London',
      country: 'United Kingdom',
    },
  ],
  venue_images: [],
};

const standaloneImageGroupRow = {
  venue_id: 'venue-test-id',
  venue_name: 'Pepper Palace',
  city: 'London',
  venue_name_slug: 'pepper-palace',
  user_id: 'submitter-user-id',
  username: 'pepper_admin',
  image_count: 1,
  last_created_at: '2026-05-01T10:00:00.000Z',
  images: [
    {
      image_id: 'image-test-id',
      created_at: '2026-05-01T10:00:00.000Z',
      review_id: null,
      alt_text: 'Standalone image',
      status: 'pending',
      image_type: 'standalone',
      image_path: {
        lg: 'image-lg.jpg',
        md: 'image-md.jpg',
        sm: 'image-sm.jpg',
      },
    },
  ],
};

describe('apiModeration review reads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses inner joins on profiles and venue_details for the review queue', async () => {
    const query = createSupabaseQueryMock({ count: 0, data: [] });
    supabaseMocks.state.query = query;

    await getModerationReviews();

    expect(supabaseMocks.from).toHaveBeenCalledWith('venue_reviews');
    const selectCall = query.select.mock.calls[0]?.[0] as string;
    expect(selectCall).toContain('profiles!inner(username)');
    expect(selectCall).toContain('venue_details!inner(*)');
  });

  it('normalizes venueDetails array to a single object on the review queue', async () => {
    const query = createSupabaseQueryMock({
      count: 1,
      data: [moderationReviewRow],
    });
    supabaseMocks.state.query = query;

    const { data } = await getModerationReviews();

    expect(data).toHaveLength(1);
    expect(data[0].venueDetails).toMatchObject({
      venueName: 'Pepper Palace',
      city: 'London',
      country: 'United Kingdom',
    });
    expect(Array.isArray(data[0].venueDetails)).toBe(false);
  });

  it('normalizes venueDetails array to a single object on a review detail read', async () => {
    const query = createSupabaseQueryMock({ data: moderationReviewRow });
    supabaseMocks.state.query = query;

    const review = await getModerationReview('review-test-id');

    expect(review.venueDetails).toMatchObject({
      venueName: 'Pepper Palace',
    });
    expect(Array.isArray(review.venueDetails)).toBe(false);
  });
});

describe('apiModeration standalone image reads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads standalone image groups from the pending grouping view', async () => {
    const query = createSupabaseQueryMock({
      count: 1,
      data: [standaloneImageGroupRow],
    });
    supabaseMocks.state.query = query;

    const { data, count } = await getModerationStandaloneImages();

    expect(supabaseMocks.from).toHaveBeenCalledWith(
      'pending_standalone_image_groups'
    );
    expect(query.select).toHaveBeenCalledWith('*', { count: 'exact' });
    expect(query.order).toHaveBeenCalledWith('last_created_at', {
      ascending: false,
    });
    expect(count).toBe(1);
    expect(data[0]).toMatchObject({
      groupId: 'venue-test-id:submitter-user-id',
      imageCount: 1,
      username: 'pepper_admin',
      venueName: 'Pepper Palace',
    });
    expect(data[0].images[0]).toMatchObject({
      imageId: 'image-test-id',
      imageType: 'standalone',
      status: 'pending',
      userId: 'submitter-user-id',
      venueId: 'venue-test-id',
    });
    expect(data[0].images[0].imagePath.md).toBe(
      'https://example.supabase.co/storage/v1/object/public/venue-images/image-md.jpg'
    );
  });

  it('loads one standalone image group by derived group id', async () => {
    const query = createSupabaseQueryMock({
      count: 1,
      data: [standaloneImageGroupRow],
    });
    supabaseMocks.state.query = query;

    const group = await getModerationStandaloneImageGroup(
      'venue-test-id:submitter-user-id'
    );

    expect(group.venueName).toBe('Pepper Palace');
    expect(group.images).toHaveLength(1);
  });
});

describe('apiModeration image status updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('batches approved and declined image ids on venue_images', async () => {
    const query = createSupabaseQueryMock({ data: null });
    supabaseMocks.state.query = query;

    await updateModerationImageStatuses({
      approvedImageIds: ['image-1', 'image-2'],
      declinedImageIds: ['image-3'],
    });

    expect(supabaseMocks.from).toHaveBeenCalledWith('venue_images');
    expect(query.update).toHaveBeenCalledWith({ status: 'approved' });
    expect(query.update).toHaveBeenCalledWith({ status: 'declined' });
    expect(query.in).toHaveBeenCalledWith('image_id', ['image-1', 'image-2']);
    expect(query.in).toHaveBeenCalledWith('image_id', ['image-3']);
  });

  it('skips the update branch when no image ids are provided for a status', async () => {
    const query = createSupabaseQueryMock({ data: null });
    supabaseMocks.state.query = query;

    await updateModerationImageStatuses({
      approvedImageIds: ['image-1'],
      declinedImageIds: [],
    });

    expect(query.update).toHaveBeenCalledTimes(1);
    expect(query.update).toHaveBeenCalledWith({ status: 'approved' });
    expect(query.in).toHaveBeenCalledTimes(1);
    expect(query.in).toHaveBeenCalledWith('image_id', ['image-1']);
  });
});
