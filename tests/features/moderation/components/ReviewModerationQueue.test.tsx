import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewModerationQueue from '@/features/moderation/components/ReviewModerationQueue';
import { ModerationReview } from '@/types/reviewTypes';
import AllProviders from 'tests/AllProviders';
import {
  getModerationReviewCitiesMock,
  getModerationReviewsMock,
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

function renderQueue() {
  return render(
    <MemoryRouter>
      <ReviewModerationQueue />
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('ReviewModerationQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModerationReviewCitiesMock.mockResolvedValue([
      {
        cityId: 'london',
        city: 'London',
        country: 'United Kingdom',
        coords: { lat: 51.5072, lon: -0.1276 },
      },
    ]);
    getModerationReviewsMock.mockResolvedValue({
      data: [createModerationReview()],
      count: 1,
    });
  });

  it('renders moderation status filters and pending reviews by default', async () => {
    renderQueue();

    expect(
      screen.getByRole('heading', { name: /review moderation/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pending/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /approved/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /declined/i })).toBeInTheDocument();

    expect(await screen.findByText(/big heat, clean flavor/i)).toBeInTheDocument();
    expect(screen.getByText(/pepper palace/i)).toBeInTheDocument();
    expect(screen.getByText(/pepper_admin/i)).toBeInTheDocument();
    expect(screen.getByText(/submitter-user-id/i)).toBeInTheDocument();
    expect(screen.getByText(/heat 4 \/ quality 5/i)).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /london - united kingdom/i })
    ).toBeInTheDocument();

    expect(getModerationReviewsMock).toHaveBeenCalledWith({
      status: 'pending',
      filters: [],
      sort: undefined,
      pagination: { pageNumber: 1, maxResults: 8 },
    });
    expect(getModerationReviewCitiesMock).toHaveBeenCalledWith({
      status: 'pending',
    });
  });

  it('links review rows to the moderation detail route', async () => {
    renderQueue();

    const reviewLink = await screen.findByRole('link', {
      name: /big heat, clean flavor/i,
    });

    expect(reviewLink).toHaveAttribute(
      'href',
      '/admin/moderation/reviews/review-test-id'
    );
  });

  it('requests approved reviews when the approved status filter is selected', async () => {
    const user = userEvent.setup();
    renderQueue();

    expect(await screen.findByText(/big heat, clean flavor/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /approved/i }));

    await waitFor(() => {
      expect(getModerationReviewsMock).toHaveBeenLastCalledWith({
        status: 'approved',
        filters: [],
        sort: undefined,
        pagination: { pageNumber: 1, maxResults: 8 },
      });
    });
    expect(getModerationReviewCitiesMock).toHaveBeenLastCalledWith({
      status: 'approved',
    });
    expect(screen.getByRole('button', { name: /approved/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('adds review queue filters after submitting search fields', async () => {
    const user = userEvent.setup();
    renderQueue();

    expect(await screen.findByText(/big heat, clean flavor/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/venue/i), 'Pepper');
    await user.selectOptions(
      screen.getByLabelText(/city/i),
      'London|United Kingdom'
    );
    await user.type(screen.getByLabelText(/submitter/i), 'pepper');
    await user.type(screen.getByLabelText(/review text/i), 'clean flavor');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(getModerationReviewsMock).toHaveBeenLastCalledWith({
        status: 'pending',
        filters: [
          {
            field: 'venueDetails.venueName',
            value: '%Pepper%',
            method: 'ilike',
          },
          { field: 'venueDetails.city', value: 'London', method: 'eq' },
          {
            field: 'venueDetails.country',
            value: 'United Kingdom',
            method: 'eq',
          },
          { field: 'profiles.username', value: '%pepper%', method: 'ilike' },
          { field: 'reviewContent', value: '%clean flavor%', method: 'ilike' },
        ],
        sort: undefined,
        pagination: { pageNumber: 1, maxResults: 8 },
      });
    });
  });

  it('names the selected city when no reviews match the city filter', async () => {
    const user = userEvent.setup();
    getModerationReviewsMock.mockResolvedValue({
      data: [],
      count: 0,
    });
    renderQueue();

    await screen.findByRole('option', { name: /london - united kingdom/i });

    await user.selectOptions(
      screen.getByLabelText(/city/i),
      'London|United Kingdom'
    );

    expect(
      await screen.findByText(/no pending reviews found for london, united kingdom/i)
    ).toBeInTheDocument();
  });
});
