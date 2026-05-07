import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminLayout from '@/features/moderation/components/AdminLayout';
import ReviewModerationDetail from '@/features/moderation/components/ReviewModerationDetail';
import ReviewModerationQueue from '@/features/moderation/components/ReviewModerationQueue';
import { ModerationReview } from '@/types/reviewTypes';
import AllProviders from 'tests/AllProviders';
import {
  getModerationCitiesMock,
  getModerationReviewMock,
  getModerationReviewsMock,
  updateModerationImageStatusesMock,
  updateModerationReviewMock,
  updateModerationReviewStatusMock,
} from 'tests/mocks/apiModeration';

function createModerationReview(
  overrides: Partial<ModerationReview> = {}
): ModerationReview {
  return {
    createdAt: '2026-05-01T10:00:00.000Z',
    heatRating: 4,
    hottestDish: 'Fire noodles',
    hottestSauce: 'Ghost sauce',
    qualityRating: 5,
    reviewContent: 'A submitted review waiting for moderation.',
    reviewId: 'review-test-id',
    reviewTitle: 'Big heat, clean flavor',
    reviewType: 'restaurant',
    status: 'pending',
    submitterUsername: 'pepper_admin',
    userId: 'submitter-user-id',
    venueDetails: {
      address: '1 Pepper Street',
      city: 'London',
      coords: { lat: 51.5072, lon: -0.1276 },
      country: 'United Kingdom',
      description: 'A submitted venue.',
      detailedAddress: '1 Pepper Street, London',
      phoneNumber: '+44 1234 567890',
      postcode: 'SW1A 1AA',
      userId: 'venue-user-id',
      venueId: 'venue-test-id',
      venueName: 'Pepper Palace',
      venueNameSlug: 'pepper-palace',
      venueType: 'restaurant',
      website: 'https://example.com',
    },
    venueId: 'venue-test-id',
    venueImages: [],
    ...overrides,
  };
}

function renderReviewModeration(initialPath = '/admin/moderation/reviews') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            path="moderation/reviews"
            element={<ReviewModerationQueue />}
          />
          <Route
            path="moderation/reviews/:reviewId"
            element={<ReviewModerationDetail />}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('ReviewModerationFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModerationCitiesMock.mockResolvedValue([]);
    getModerationReviewsMock.mockResolvedValue({
      data: [createModerationReview()],
      count: 1,
    });
    getModerationReviewMock.mockResolvedValue(createModerationReview());
    updateModerationImageStatusesMock.mockResolvedValue();
    updateModerationReviewMock.mockResolvedValue(createModerationReview());
    updateModerationReviewStatusMock.mockResolvedValue();
  });

  it('opens a review detail screen from the moderation queue', async () => {
    const user = userEvent.setup();

    renderReviewModeration();

    await user.click(
      await screen.findByRole('link', {
        name: /big heat, clean flavor/i,
      })
    );

    expect(
      await screen.findByRole('heading', { name: /review details/i })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(getModerationReviewMock).toHaveBeenCalledWith('review-test-id');
    });
    expect(
      screen.getByRole('link', { name: /back to review queue/i })
    ).toHaveAttribute('href', '/admin/moderation/reviews');
  });
});
