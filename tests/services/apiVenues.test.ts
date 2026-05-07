import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getVenue, getVenues } from '@/services/apiVenues';

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
  };

  return query;
}

describe('apiVenues moderation boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters public venue lists to approved venues only', async () => {
    const query = createSupabaseQueryMock({ count: 0, data: [] });
    supabaseMocks.state.query = query;

    await getVenues({ filters: [] });

    expect(supabaseMocks.from).toHaveBeenCalledWith('venue_details');
    expect(query.select).toHaveBeenCalledWith('*', { count: 'exact' });
    expect(query.eq).toHaveBeenCalledWith('status', 'approved');
  });

  it('filters public venue detail reads and images to approved content only', async () => {
    const query = createSupabaseQueryMock({
      data: [
        {
          venue_id: 'venue-test-id',
          venue_images: [],
        },
      ],
    });
    supabaseMocks.state.query = query;

    await getVenue('venue-test-id');

    expect(supabaseMocks.from).toHaveBeenCalledWith('venue_details');
    expect(query.eq).toHaveBeenCalledWith('venue_id', 'venue-test-id');
    expect(query.eq).toHaveBeenCalledWith('status', 'approved');
    expect(query.filter).toHaveBeenCalledWith(
      'venue_images.status',
      'eq',
      'approved'
    );
  });
});
