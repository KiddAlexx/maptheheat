import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewModerationDetail from '@/features/moderation/components/ReviewModerationDetail';
import { ModerationReview } from '@/types/reviewTypes';
import AllProviders from 'tests/AllProviders';
import {
  getModerationReviewMock,
  insertModerationNotificationMock,
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
    venueImages: [
      {
        altText: 'Review photo of fire noodles',
        createdAt: '2026-05-01T10:05:00.000Z',
        imageId: 'image-1',
        imagePath: {
          lg: 'image-lg.jpg',
          md: 'image-md.jpg',
          sm: 'image-sm.jpg',
        },
        imageType: 'review',
        reviewId: 'review-test-id',
        status: 'pending',
        userId: 'submitter-user-id',
        venueId: 'venue-test-id',
      },
    ],
    ...overrides,
  };
}

function renderDetail(path = '/admin/moderation/reviews/review-test-id') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin/moderation/reviews/:reviewId"
          element={<ReviewModerationDetail />}
        />
        <Route
          path="/admin/moderation/reviews"
          element={<ReviewModerationDetail />}
        />
      </Routes>
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('ReviewModerationDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModerationReviewMock.mockResolvedValue(createModerationReview());
    insertModerationNotificationMock.mockResolvedValue({
      createdAt: '2026-01-01T12:00:00.000Z',
      linkUrl: null,
      message: 'Your review is live',
      notificationId: 'notification-test-id',
      notificationStatus: 'unread',
      relatedType: 'review',
      requestStatus: 'confirmed',
      title: 'Review approved',
      userId: 'submitter-user-id',
      venueId: 'venue-test-id',
    });
    updateModerationImageStatusesMock.mockResolvedValue();
    updateModerationReviewMock.mockResolvedValue(createModerationReview());
    updateModerationReviewStatusMock.mockResolvedValue();
  });

  it('loads the review by route id and renders moderation detail metadata', async () => {
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /big heat, clean flavor/i })
    ).toBeInTheDocument();

    expect(getModerationReviewMock).toHaveBeenCalledWith('review-test-id');
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getByText('pepper_admin')).toBeInTheDocument();
    expect(screen.getByText('submitter-user-id')).toBeInTheDocument();
    expect(screen.getByText(/01 May 2026/)).toBeInTheDocument();
    expect(screen.getByText(/heat 4 \/ quality 5/i)).toBeInTheDocument();
    expect(screen.getAllByText(/submitted review waiting/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getByText('Fire noodles')).toBeInTheDocument();
    expect(screen.getByText('Ghost sauce')).toBeInTheDocument();
    expect(screen.getByText('Pepper Palace')).toBeInTheDocument();
    expect(screen.getByText('London, United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('review-test-id')).toBeInTheDocument();
    expect(screen.getByText('venue-test-id')).toBeInTheDocument();
  });

  it('submits selected review image status decisions', async () => {
    const user = userEvent.setup();
    getModerationReviewMock.mockResolvedValue(
      createModerationReview({
        venueImages: [
          {
            altText: 'Review photo of fire noodles',
            createdAt: '2026-05-01T10:05:00.000Z',
            imageId: 'image-1',
            imagePath: {
              lg: 'image-1-lg.jpg',
              md: 'image-1-md.jpg',
              sm: 'image-1-sm.jpg',
            },
            imageType: 'review',
            reviewId: 'review-test-id',
            status: 'pending',
            userId: 'submitter-user-id',
            venueId: 'venue-test-id',
          },
          {
            altText: 'Review photo of the sauce shelf',
            createdAt: '2026-05-01T10:06:00.000Z',
            imageId: 'image-2',
            imagePath: {
              lg: 'image-2-lg.jpg',
              md: 'image-2-md.jpg',
              sm: 'image-2-sm.jpg',
            },
            imageType: 'review',
            reviewId: 'review-test-id',
            status: 'pending',
            userId: 'submitter-user-id',
            venueId: 'venue-test-id',
          },
        ],
      })
    );

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /big heat, clean flavor/i })
    ).toBeInTheDocument();

    await user.click(screen.getAllByLabelText(/approve image/i)[0]);
    await user.click(screen.getAllByLabelText(/decline image/i)[1]);
    await user.click(screen.getByRole('button', { name: /update images/i }));

    await waitFor(() => {
      expect(updateModerationImageStatusesMock).toHaveBeenCalledWith({
        approvedImageIds: ['image-1'],
        declinedImageIds: ['image-2'],
      });
    });
  });

  it('submits corrected review fields', async () => {
    const user = userEvent.setup();

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /big heat, clean flavor/i })
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^review title$/i));
    await user.type(screen.getByLabelText(/^review title$/i), 'Sharper review');
    await user.clear(screen.getByLabelText(/^heat rating$/i));
    await user.type(screen.getByLabelText(/^heat rating$/i), '5');
    await user.clear(screen.getByLabelText(/^quality rating$/i));
    await user.type(screen.getByLabelText(/^quality rating$/i), '4');
    await user.clear(screen.getByLabelText(/^hottest dish$/i));
    await user.type(screen.getByLabelText(/^hottest dish$/i), 'Dragon noodles');
    await user.clear(screen.getByLabelText(/^review content$/i));
    await user.type(
      screen.getByLabelText(/^review content$/i),
      'This corrected review has enough detail for moderation approval.'
    );
    await user.click(
      screen.getByRole('button', { name: /save review changes/i })
    );

    await waitFor(() => {
      expect(updateModerationReviewMock).toHaveBeenCalledWith({
        reviewId: 'review-test-id',
        reviewUpdate: expect.objectContaining({
          heatRating: 5,
          hottestDish: 'Dragon noodles',
          qualityRating: 4,
          reviewContent:
            'This corrected review has enough detail for moderation approval.',
          reviewTitle: 'Sharper review',
        }),
      });
    });
  });

  it('uses a partial notification draft when an edited review is approved', async () => {
    const user = userEvent.setup();
    const expectedVenueLink =
      'https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id';
    const expectedMessage = [
      'Yay, your review for Pepper Palace has been approved.',
      'We made a few small edits before publishing it.',
      `You can find the review here: ${expectedVenueLink}`,
    ].join(' ');
    const updatedReview = createModerationReview({
      reviewTitle: 'Sharper review',
      venueImages: [],
    });
    getModerationReviewMock.mockResolvedValue(
      createModerationReview({ venueImages: [] })
    );
    updateModerationReviewMock.mockResolvedValue(updatedReview);

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /big heat, clean flavor/i })
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^review title$/i));
    await user.type(screen.getByLabelText(/^review title$/i), 'Sharper review');
    await user.click(
      screen.getByRole('button', { name: /save review changes/i })
    );

    await waitFor(() => {
      expect(updateModerationReviewMock).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: /approve review/i }));

    expect(
      await screen.findByRole('heading', { name: /send notification/i })
    ).toBeInTheDocument();
    expect(screen.getByText('partial')).toBeInTheDocument();
    expect(screen.getByLabelText(/mention edits/i)).toBeChecked();
    expect(screen.getByLabelText(/include venue link/i)).toBeChecked();
    expect(screen.getByLabelText(/^title$/i)).toHaveDisplayValue(
      'Your review for Pepper Palace is live with a few edits'
    );

    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(updateModerationReviewStatusMock).toHaveBeenCalledWith({
        reviewId: 'review-test-id',
        status: 'approved',
      });
      expect(insertModerationNotificationMock).toHaveBeenCalledWith({
        userId: 'submitter-user-id',
        relatedType: 'review',
        title: 'Your review for Pepper Palace is live with a few edits',
        message: expectedMessage,
        linkUrl: expectedVenueLink,
        venueId: 'venue-test-id',
        requestStatus: 'confirmed',
      });
    });
  });

  it('approves a review submission', async () => {
    const user = userEvent.setup();
    getModerationReviewMock.mockResolvedValue(
      createModerationReview({ venueImages: [] })
    );

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /big heat, clean flavor/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /approve review/i }));

    await waitFor(() => {
      expect(updateModerationReviewStatusMock).toHaveBeenCalledWith({
        reviewId: 'review-test-id',
        status: 'approved',
      });
    });
  });

  it('does not approve a pending review until pending images have decisions', async () => {
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /big heat, clean flavor/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/resolve all pending image decisions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /approve review/i })
    ).toBeDisabled();
    expect(updateModerationReviewStatusMock).not.toHaveBeenCalled();
  });

  it('updates pending image decisions before approving a review submission', async () => {
    const user = userEvent.setup();

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /big heat, clean flavor/i })
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText(/approve image/i));
    await user.click(screen.getByRole('button', { name: /approve review/i }));

    await waitFor(() => {
      expect(updateModerationImageStatusesMock).toHaveBeenCalledWith({
        approvedImageIds: ['image-1'],
        declinedImageIds: [],
      });
    });
    await waitFor(() => {
      expect(updateModerationReviewStatusMock).toHaveBeenCalledWith({
        reviewId: 'review-test-id',
        status: 'approved',
      });
    });
  });

  it('declines a review submission', async () => {
    const user = userEvent.setup();

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /big heat, clean flavor/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /decline review/i }));

    await waitFor(() => {
      expect(updateModerationReviewStatusMock).toHaveBeenCalledWith({
        reviewId: 'review-test-id',
        status: 'declined',
      });
    });
  });

  it('disables the review action matching the current status', async () => {
    getModerationReviewMock.mockResolvedValue(
      createModerationReview({ status: 'approved' })
    );

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /big heat, clean flavor/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /approve review/i })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /decline review/i })
    ).toBeEnabled();
  });

  it('renders an error state when the review cannot be loaded', async () => {
    getModerationReviewMock.mockRejectedValue(new Error('Not allowed'));

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /review submission could not be loaded/i
    );
    expect(
      screen.getByRole('link', { name: /back to review queue/i })
    ).toHaveAttribute('href', '/admin/moderation/reviews');
  });

  it('renders a not found state when no review id is present', async () => {
    renderDetail('/admin/moderation/reviews');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /review submission not found/i
      );
    });
  });
});
