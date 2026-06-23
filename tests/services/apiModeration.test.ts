import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/apiModeration');

const {
  getModerationReview,
  getModerationReviews,
  getModerationStandaloneImageGroup,
  getModerationStandaloneImages,
  insertModerationNotification,
  searchModerationNotificationRecipients,
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
  ilike: QueryMethod;
  in: QueryMethod;
  insert: QueryMethod;
  limit: QueryMethod;
  order: QueryMethod;
  range: QueryMethod;
  select: QueryMethod;
  single: QueryMethod;
  update: QueryMethod;
}

const supabaseMocks = vi.hoisted(() => {
  const state: { query?: unknown; rpcResult?: unknown } = {};

  return {
    from: vi.fn(() => state.query),
    rpc: vi.fn(() => state.rpcResult),
    state,
  };
});

vi.mock('@/services/supabase', () => ({
  supabaseUrl: 'https://example.supabase.co',
  default: {
    from: supabaseMocks.from,
    rpc: supabaseMocks.rpc,
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
    ilike: vi.fn(() => query),
    in: vi.fn(() => query),
    insert: vi.fn(() => query),
    limit: vi.fn(() => query),
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
  country: 'United Kingdom',
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

describe('apiModeration notification services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches notification recipients by exact user id for UUID queries', async () => {
    const query = createSupabaseQueryMock({
      data: [{ user_id: '11111111-1111-4111-8111-111111111111', username: 'admin_user' }],
    });
    supabaseMocks.state.query = query;

    const recipients = await searchModerationNotificationRecipients(
      '11111111-1111-4111-8111-111111111111'
    );

    expect(supabaseMocks.from).toHaveBeenCalledWith('profiles');
    expect(query.select).toHaveBeenCalledWith('user_id, username');
    expect(query.eq).toHaveBeenCalledWith(
      'user_id',
      '11111111-1111-4111-8111-111111111111'
    );
    expect(query.ilike).not.toHaveBeenCalled();
    expect(recipients).toEqual([
      {
        userId: '11111111-1111-4111-8111-111111111111',
        username: 'admin_user',
      },
    ]);
  });

  it('returns empty array for empty or whitespace-only queries without calling Supabase', async () => {
    const query = createSupabaseQueryMock({ data: [] });
    supabaseMocks.state.query = query;

    const resultEmpty = await searchModerationNotificationRecipients('');
    const resultWhitespace = await searchModerationNotificationRecipients('   ');

    expect(resultEmpty).toEqual([]);
    expect(resultWhitespace).toEqual([]);
    expect(supabaseMocks.from).not.toHaveBeenCalled();
  });

  it('searches notification recipients by username for non-UUID queries', async () => {
    const query = createSupabaseQueryMock({
      data: [{ user_id: 'user-test-id', username: 'pepper_admin' }],
    });
    supabaseMocks.state.query = query;

    await searchModerationNotificationRecipients('pepper');

    expect(supabaseMocks.from).toHaveBeenCalledWith('profiles');
    expect(query.ilike).toHaveBeenCalledWith('username', '%pepper%');
    expect(query.eq).not.toHaveBeenCalled();
  });

  it('escapes ilike wildcards in username queries', async () => {
    const query = createSupabaseQueryMock({ data: [] });
    supabaseMocks.state.query = query;

    await searchModerationNotificationRecipients('user%name');

    expect(query.ilike).toHaveBeenCalledWith('username', '%user\\%name%');
  });

  it('sends notification payloads through the admin RPC with snake case keys', async () => {
    supabaseMocks.state.rpcResult = {
      data: {
        notification_id: 'notification-test-id',
        created_at: '2026-05-01T10:00:00.000Z',
        related_type: 'venue',
        title: 'Venue approved',
        message: 'Your venue is live',
        link_url: 'https://example.com/venue',
        venue_id: 'venue-test-id',
        user_id: 'user-test-id',
        notification_status: 'unread',
        request_status: 'confirmed',
      },
      error: null,
    };

    const notification = await insertModerationNotification({
      userId: 'user-test-id',
      venueId: 'venue-test-id',
      relatedType: 'venue',
      title: 'Venue approved',
      message: 'Your venue is live',
      linkUrl: 'https://example.com/venue',
      requestStatus: 'confirmed',
    });

    expect(supabaseMocks.rpc).toHaveBeenCalledWith(
      'admin_insert_notification',
      {
        p: {
          user_id: 'user-test-id',
          venue_id: 'venue-test-id',
          related_type: 'venue',
          title: 'Venue approved',
          message: 'Your venue is live',
          link_url: 'https://example.com/venue',
          request_status: 'confirmed',
        },
      }
    );
    expect(notification).toMatchObject({
      notificationId: 'notification-test-id',
      requestStatus: 'confirmed',
    });
  });
});

describe('apiModeration review reads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps ownerless reviews in the queue while requiring venue details', async () => {
    const query = createSupabaseQueryMock({ count: 0, data: [] });
    supabaseMocks.state.query = query;

    await getModerationReviews();

    expect(supabaseMocks.from).toHaveBeenCalledWith('venue_reviews');
    const selectCall = query.select.mock.calls[0]?.[0] as string;
    expect(selectCall).toContain('profiles(username)');
    expect(selectCall).not.toContain('profiles!inner(username)');
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
      country: 'United Kingdom',
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

  it('fills missing standalone image venue route fields from venue details', async () => {
    const groupingQuery = createSupabaseQueryMock({
      count: 1,
      data: [
        {
          ...standaloneImageGroupRow,
          country: null,
          venue_name_slug: null,
        },
      ],
    });
    const venueQuery = createSupabaseQueryMock({
      data: [
        {
          venue_id: 'venue-test-id',
          venue_name: 'Pepper Palace',
          city: 'London',
          country: 'United Kingdom',
          venue_name_slug: 'pepper-palace',
        },
      ],
    });
    supabaseMocks.from
      .mockReturnValueOnce(groupingQuery)
      .mockReturnValueOnce(venueQuery);

    const { data } = await getModerationStandaloneImages();

    expect(supabaseMocks.from).toHaveBeenCalledWith('venue_details');
    expect(venueQuery.select).toHaveBeenCalledWith(
      'venue_id, venue_name, city, country, venue_name_slug'
    );
    expect(venueQuery.in).toHaveBeenCalledWith('venue_id', ['venue-test-id']);
    expect(data[0]).toMatchObject({
      country: 'United Kingdom',
      venueNameSlug: 'pepper-palace',
    });
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
