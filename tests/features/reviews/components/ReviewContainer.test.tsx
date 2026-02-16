import { it, expect, describe } from 'vitest';
import {
  logRoles,
  screen,
  waitForElementToBeRemoved,
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
    screen.debug(undefined, Infinity);
    logRoles(document.body);
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

  const getReviewCards = () => {
    const cards = screen.getAllByRole('article');
    return cards;
  };

  return { getLoaderSpinner, getReviewCards };
};
