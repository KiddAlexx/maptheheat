import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useModerationCities } from '@/features/moderation/hooks/useModerationCities';
import { useModerationVenues } from '@/features/moderation/hooks/useModerationVenues';
import AllProviders from 'tests/AllProviders';
import {
  getModerationCitiesMock,
  getModerationVenuesMock,
} from 'tests/mocks/apiModeration';

describe('moderation query hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModerationVenuesMock.mockResolvedValue({
      data: [],
      count: 0,
    });
    getModerationCitiesMock.mockResolvedValue([]);
  });

  it('requests pending venues by default', async () => {
    renderHook(() => useModerationVenues(), { wrapper: AllProviders });

    await waitFor(() => {
      expect(getModerationVenuesMock).toHaveBeenCalledWith({
        status: 'pending',
        filters: [],
        sort: undefined,
        pagination: undefined,
      });
    });
  });

  it('requests pending moderation cities by default', async () => {
    renderHook(() => useModerationCities(), { wrapper: AllProviders });

    await waitFor(() => {
      expect(getModerationCitiesMock).toHaveBeenCalledWith({
        status: 'pending',
      });
    });
  });
});
