import { it, expect, describe } from 'vitest';
import {
  logRoles,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

  it('should render sort component', async () => {
    const { venue } = seedVenueWithReviews(DEFAULT_REVIEWS_PAGE_SIZE);
    const { getLoaderSpinner } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);

    expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument();
  });

  it('should render sort component with options', async () => {
    const { venue } = seedVenueWithReviews(DEFAULT_REVIEWS_PAGE_SIZE);
    const { getLoaderSpinner } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /sort by/i }));

    expect(
      screen.getByRole('option', { name: /hottest/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /mildest/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /highest quality/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /lowest quality/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /newest/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /oldest/i })).toBeInTheDocument();
  });

  it('should sort reviews by heat rating in descending order', async () => {
    const { venue } = seedVenueWithReviews(DEFAULT_REVIEWS_PAGE_SIZE);
    const { selectSortOption, getHeatRatingsInDomOrder } =
      await renderComponent({
        venue,
      });

    await selectSortOption(/hottest/i);

    const heatRatingsInDomOrder = getHeatRatingsInDomOrder();
    for (let i = 1; i < heatRatingsInDomOrder.length; i++) {
      expect(heatRatingsInDomOrder[i]).toBeLessThanOrEqual(
        heatRatingsInDomOrder[i - 1]
      );
    }
  });

  it('should sort reviews by heat rating in ascending order', async () => {
    const { venue } = seedVenueWithReviews(DEFAULT_REVIEWS_PAGE_SIZE);
    const { selectSortOption, getHeatRatingsInDomOrder } =
      await renderComponent({
        venue,
      });

    await selectSortOption(/mildest/i);

    const heatRatingsInDomOrder = getHeatRatingsInDomOrder();
    for (let i = 1; i < heatRatingsInDomOrder.length; i++) {
      expect(heatRatingsInDomOrder[i]).toBeGreaterThanOrEqual(
        heatRatingsInDomOrder[i - 1]
      );
    }
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

  const getVisibleReviewCards = () => {
    return screen.getAllByRole('article');
  };

  const getHeatRatingsInDomOrder = () => {
    return getVisibleReviewCards().map((card) => {
      const ratingLabel = within(card).getByLabelText(/heat rating/i);
      return Number(ratingLabel.getAttribute('data-value'));
    });
  };

  const selectSortOption = async (sortOption: RegExp | string) => {
    const user = userEvent.setup();
    await waitForElementToBeRemoved(getLoaderSpinner);

    await user.click(screen.getByRole('button', { name: /sort by/i }));
    await user.click(screen.getByRole('option', { name: sortOption }));
    await waitForElementToBeRemoved(
      screen.queryByRole('listbox', { name: /sort by/i })
    );
  };

  return {
    getLoaderSpinner,
    getVisibleReviewCards,
    getHeatRatingsInDomOrder,
    selectSortOption,
  };
};
