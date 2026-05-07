import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/apiModeration');

const { getModerationReview, getModerationReviews } = await vi.importActual<
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
