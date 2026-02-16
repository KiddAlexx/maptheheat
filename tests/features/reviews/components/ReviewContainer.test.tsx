import { it, expect, describe } from 'vitest';
import {
  logRoles,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';

import ReviewContainer from '@/features/reviews/components/ReviewContainer';
import { db } from 'tests/mocks/db';

import { renderWithRoute } from 'tests/utils/renderWithRoute';
import { drop } from '@mswjs/data';
import { seedVenueWithReviews } from 'tests/utils/seedVenueWithReviews';
import { DEFAULT_REVIEWS_PAGE_SIZE } from '@/constants/constants';
import {
  simulateReviewsDelay,
  simulateReviewsError,
} from 'tests/mocks/apiReviews';
import { formatDate } from '@/utils/dateTimeHelpers';

type DbVenue = ReturnType<typeof db.venue.create>;

describe('ReviewContainer', () => {
  beforeEach(() => {
    drop(db);
  });

  it('shows loader while fetching reviews', async () => {
    const { venue } = seedVenueWithReviews(DEFAULT_REVIEWS_PAGE_SIZE);

    // Calls mock api call with delay
    simulateReviewsDelay();
    const { getLoaderSpinner } = await renderComponent({ venue });
    expect(getLoaderSpinner()).toBeInTheDocument();
    await waitForElementToBeRemoved(getLoaderSpinner);
  });

  it('should show error if reviews cannot be fetched', async () => {
    const { venue } = seedVenueWithReviews(DEFAULT_REVIEWS_PAGE_SIZE);
    simulateReviewsError('Error loading reviews');
    await renderComponent({ venue });

    expect(
      await screen.findByText(/error loading reviews/i)
    ).toBeInTheDocument();
  });

  it('should display first page of reviews on load', async () => {
    const { venue, reviews } = seedVenueWithReviews(DEFAULT_REVIEWS_PAGE_SIZE);
    const { getLoaderSpinner, getVisibleReviewCards } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);
    const reviewCards = getVisibleReviewCards();

    expect(
      screen.getByRole('heading', { name: /reviews/i })
    ).toBeInTheDocument();
    expect(reviewCards).toHaveLength(DEFAULT_REVIEWS_PAGE_SIZE);
    reviews.forEach((review) => {
      expect(screen.getByText(review.reviewTitle)).toBeInTheDocument();
    });
  });

  it('should display important review details within review card', async () => {
    const { venue, reviews, user } = seedVenueWithReviews(1);
    const { getLoaderSpinner, getVisibleReviewCards } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);
    const review = reviews[0];
    const reviewCard = within(getVisibleReviewCards()[0]);
    screen.debug(undefined, Infinity);
    logRoles(document.body);

    expect(reviewCard.getByText(review.reviewTitle)).toBeInTheDocument();
    expect(reviewCard.getByText(review.reviewContent)).toBeInTheDocument();
    expect(reviewCard.getByText(user.username)).toBeInTheDocument();
    const expectedDate = formatDate(review.createdAt);
    expect(reviewCard.getByText(expectedDate)).toBeInTheDocument();
    expect(reviewCard.getByRole('img', { name: /avatar/i }));
    expect(
      reviewCard.getByLabelText(`Review heat rating ${review.heatRating}`)
    ).toBeInTheDocument();
    expect(
      reviewCard.getByLabelText(`Review quality rating ${review.qualityRating}`)
    ).toBeInTheDocument();
    expect(
      reviewCard.getByRole('button', { name: /open review actions/i })
    ).toBeInTheDocument();
  });
});

interface RenderComponentProps {
  venue: DbVenue;
}

const renderComponent = async ({ venue }: RenderComponentProps) => {
  renderWithRoute({
    element: <ReviewContainer mode="venue" />,
    route: `/app/venue/${venue.city}/${venue.venueNameSlug}/${venue.venueId}`,
    path: '/app/venue/:city/:venue/:venueId',
  });

  const getLoaderSpinner = () =>
    screen.queryByRole('status', {
      name: /loading reviews/i,
    });

  const getVisibleReviewCards = () => {
    return screen.getAllByRole('article');
  };

  return { getLoaderSpinner, getVisibleReviewCards };
};
