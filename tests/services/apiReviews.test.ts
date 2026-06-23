import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/apiReviews');

const { getReview, getReviews } = await vi.importActual<
  typeof import('@/services/apiReviews')
>('@/services/apiReviews');

type QueryMethod = ReturnType<typeof vi.fn>;

interface SupabaseQueryMock {
  count: number | null;
  data: unknown;
  error: null;
  eq: QueryMethod;
  filter: QueryMethod;
  from: QueryMethod;
  insert: QueryMethod;
  order: QueryMethod;
  range: QueryMethod;
  rpc: QueryMethod;
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
    insert: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => query),
    rpc: vi.fn(() => query),
    select: vi.fn(() => query),
    single: vi.fn(() => query),
    update: vi.fn(() => query),
  };

  return query;
}

describe('apiReviews moderation boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters public review lists and review images to approved content only', async () => {
    const query = createSupabaseQueryMock({ count: 0, data: [] });
    supabaseMocks.state.query = query;

    await getReviews({ venueId: 'venue-test-id' });

    expect(supabaseMocks.from).toHaveBeenCalledWith('venue_reviews');
    const selectCall = query.select.mock.calls[0]?.[0] as string;
    expect(selectCall).toContain('profiles(user_id, updated_at, username');
    expect(selectCall).not.toContain('profiles(*)');
    expect(query.eq).toHaveBeenCalledWith('status', 'approved');
    expect(query.eq).toHaveBeenCalledWith('venue_id', 'venue-test-id');
    expect(query.filter).toHaveBeenCalledWith(
      'venue_images.status',
      'eq',
      'approved'
    );
  });

  it('filters public review detail reads to approved reviews only', async () => {
    const query = createSupabaseQueryMock({
      data: [
        {
          review_id: 'review-test-id',
          venue_images: [],
        },
      ],
    });
    supabaseMocks.state.query = query;

    await getReview('review-test-id');

    expect(supabaseMocks.from).toHaveBeenCalledWith('venue_reviews');
    expect(query.eq).toHaveBeenCalledWith('review_id', 'review-test-id');
    expect(query.eq).toHaveBeenCalledWith('status', 'approved');
  });
});
