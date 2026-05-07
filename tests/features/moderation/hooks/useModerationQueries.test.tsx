import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useModerationCities } from '@/features/moderation/hooks/useModerationCities';
import { useModerationReview } from '@/features/moderation/hooks/useModerationReview';
import { useModerationReviewCities } from '@/features/moderation/hooks/useModerationReviewCities';
import { useModerationReviews } from '@/features/moderation/hooks/useModerationReviews';
import { useModerationStandaloneImageGroup } from '@/features/moderation/hooks/useModerationStandaloneImageGroup';
import { useModerationStandaloneImages } from '@/features/moderation/hooks/useModerationStandaloneImages';
import { useModerationVenues } from '@/features/moderation/hooks/useModerationVenues';
import { useUpdateModerationReview } from '@/features/moderation/hooks/useUpdateModerationReview';
import { useUpdateModerationReviewStatus } from '@/features/moderation/hooks/useUpdateModerationReviewStatus';
import { useUpdateStandaloneImageStatuses } from '@/features/moderation/hooks/useUpdateStandaloneImageStatuses';
import { ModerationReview } from '@/types/reviewTypes';
import { ModerationStandaloneImageGroup } from '@/types/venueTypes';
import AllProviders from 'tests/AllProviders';
import {
  getModerationCitiesMock,
  getModerationReviewMock,
  getModerationReviewsMock,
  getModerationStandaloneImageGroupMock,
  getModerationStandaloneImagesMock,
  getModerationVenuesMock,
  updateModerationImageStatusesMock,
  updateModerationReviewMock,
  updateModerationReviewStatusMock,
} from 'tests/mocks/apiModeration';

function createModerationReview(
  overrides: Partial<ModerationReview> = {}
): ModerationReview {
  return {
    createdAt: '2026-01-01T12:00:00.000Z',
    heatRating: 4,
    hottestDish: 'Fire noodles',
    hottestSauce: 'Ghost sauce',
    qualityRating: 5,
    reviewContent: 'A submitted review waiting for moderation.',
    reviewId: 'review-test-id',
    reviewTitle: 'Great heat',
    reviewType: 'restaurant',
    status: 'pending',
    submitterUsername: 'pepperfan',
    userId: 'user-test-id',
    venueId: 'venue-test-id',
    venueImages: [],
    ...overrides,
  };
}

function createStandaloneImageGroup(
  overrides: Partial<ModerationStandaloneImageGroup> = {}
): ModerationStandaloneImageGroup {
  return {
    city: 'London',
    groupId: 'venue-test-id:user-test-id',
    imageCount: 1,
    images: [
      {
        altText: 'Standalone image',
        createdAt: '2026-01-01T12:00:00.000Z',
        imageId: 'image-test-id',
        imagePath: {
          lg: 'image-lg.jpg',
          md: 'image-md.jpg',
          sm: 'image-sm.jpg',
        },
        imageType: 'standalone',
        reviewId: null,
        status: 'pending',
        userId: 'user-test-id',
        venueId: 'venue-test-id',
      },
    ],
    lastCreatedAt: '2026-01-01T12:00:00.000Z',
    userId: 'user-test-id',
    username: 'pepperfan',
    venueId: 'venue-test-id',
    venueName: 'Pepper Palace',
    venueNameSlug: 'pepper-palace',
    ...overrides,
  };
}

describe('moderation query hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModerationVenuesMock.mockResolvedValue({
      data: [],
      count: 0,
    });
    getModerationReviewsMock.mockResolvedValue({
      data: [],
      count: 0,
    });
    getModerationStandaloneImagesMock.mockResolvedValue({
      data: [],
      count: 0,
    });
    getModerationStandaloneImageGroupMock.mockResolvedValue(
      createStandaloneImageGroup()
    );
    getModerationReviewMock.mockResolvedValue(createModerationReview());
    updateModerationReviewStatusMock.mockResolvedValue();
    updateModerationReviewMock.mockResolvedValue(createModerationReview());
    updateModerationImageStatusesMock.mockResolvedValue();
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
        scope: 'venue',
        status: 'pending',
      });
    });
  });

  it('requests pending reviews by default', async () => {
    renderHook(() => useModerationReviews(), { wrapper: AllProviders });

    await waitFor(() => {
      expect(getModerationReviewsMock).toHaveBeenCalledWith({
        status: 'pending',
        filters: [],
        sort: undefined,
        pagination: undefined,
      });
    });
  });

  it('requests pending standalone image groups by default', async () => {
    renderHook(() => useModerationStandaloneImages(), {
      wrapper: AllProviders,
    });

    await waitFor(() => {
      expect(getModerationStandaloneImagesMock).toHaveBeenCalledWith({
        status: 'pending',
        filters: [],
        pagination: undefined,
      });
    });
  });

  it('requests pending review moderation cities by default', async () => {
    renderHook(() => useModerationReviewCities(), { wrapper: AllProviders });

    await waitFor(() => {
      expect(getModerationCitiesMock).toHaveBeenCalledWith({
        scope: 'review',
        status: 'pending',
      });
    });
  });

  it('loads a single moderation review by id', async () => {
    renderHook(() => useModerationReview('review-test-id'), {
      wrapper: AllProviders,
    });

    await waitFor(() => {
      expect(getModerationReviewMock).toHaveBeenCalledWith('review-test-id');
    });
  });

  it('loads a single standalone image moderation group by id', async () => {
    renderHook(
      () => useModerationStandaloneImageGroup('venue-test-id:user-test-id'),
      {
        wrapper: AllProviders,
      }
    );

    await waitFor(() => {
      expect(getModerationStandaloneImageGroupMock).toHaveBeenCalledWith(
        'venue-test-id:user-test-id'
      );
    });
  });

  it('updates a review moderation status', async () => {
    const { result } = renderHook(() => useUpdateModerationReviewStatus(), {
      wrapper: AllProviders,
    });

    act(() => {
      result.current.updateStatus({
        reviewId: 'review-test-id',
        status: 'approved',
      });
    });

    await waitFor(() => {
      expect(updateModerationReviewStatusMock).toHaveBeenCalledWith({
        reviewId: 'review-test-id',
        status: 'approved',
      });
    });
  });

  it('updates moderation review fields', async () => {
    const updatedReview = createModerationReview({
      reviewTitle: 'Corrected title',
    });
    updateModerationReviewMock.mockResolvedValue(updatedReview);

    const { result } = renderHook(() => useUpdateModerationReview(), {
      wrapper: AllProviders,
    });

    act(() => {
      result.current.updateReview({
        reviewId: 'review-test-id',
        reviewUpdate: {
          reviewTitle: 'Corrected title',
        },
      });
    });

    await waitFor(() => {
      expect(updateModerationReviewMock).toHaveBeenCalledWith({
        reviewId: 'review-test-id',
        reviewUpdate: {
          reviewTitle: 'Corrected title',
        },
      });
    });
  });

  it('updates standalone image moderation statuses', async () => {
    const { result } = renderHook(
      () => useUpdateStandaloneImageStatuses('venue-test-id:user-test-id'),
      {
        wrapper: AllProviders,
      }
    );

    act(() => {
      result.current.updateImageStatuses({
        approvedImageIds: ['image-test-id'],
        declinedImageIds: [],
      });
    });

    await waitFor(() => {
      expect(updateModerationImageStatusesMock).toHaveBeenCalledWith({
        approvedImageIds: ['image-test-id'],
        declinedImageIds: [],
      });
    });
  });
});
