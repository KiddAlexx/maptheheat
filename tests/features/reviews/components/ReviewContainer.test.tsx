// Testing libraries
import { it, expect, describe } from 'vitest';
import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Helpers
import { subHours } from 'date-fns';
import { DEFAULT_REVIEWS_PAGE_SIZE } from '@/constants/constants';

// Components
import ReviewContainer from '@/features/reviews/components/ReviewContainer';

// Mocks
import { db } from 'tests/mocks/db';
import { drop } from '@mswjs/data';
import {
  simulateReviewsDelay,
  simulateReviewsError,
} from 'tests/mocks/apiReviews';
import { getCurrentUserMock } from 'tests/mocks/apiAuth';

// Utils
import { renderWithRoute } from 'tests/utils/renderWithRoute';
import { seedVenueWithReviews } from 'tests/utils/seedVenueWithReviews';
import { formatDate } from '@/utils/dateTimeHelpers';

type DbVenue = ReturnType<typeof db.venue.create>;

describe('ReviewContainer', () => {
  beforeEach(() => {
    drop(db);
  });

  it('should show loader while fetching reviews', async () => {
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
    const { venue, reviews, user: reviewAuthor } = seedVenueWithReviews(1);
    const { getLoaderSpinner, getVisibleReviewCards } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);
    const review = reviews[0];
    const reviewCard = within(getVisibleReviewCards()[0]);

    expect(reviewCard.getByText(review.reviewTitle)).toBeInTheDocument();
    expect(reviewCard.getByText(review.reviewContent)).toBeInTheDocument();
    expect(reviewCard.getByText(reviewAuthor.username)).toBeInTheDocument();
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
    const { getLoaderSpinner, user } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);
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
  });

  it('should display pagination controls when number of reviews > page size', async () => {
    const { venue } = seedVenueWithReviews(DEFAULT_REVIEWS_PAGE_SIZE * 3);
    const { getLoaderSpinner } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);

    const prevButtons = screen.getAllByRole('button', {
      name: /prev/i,
    });
    expect(prevButtons).toHaveLength(2);
    const nextButtons = screen.getAllByRole('button', {
      name: /next/i,
    });
    expect(nextButtons).toHaveLength(2);

    const pageOneButton = screen.getAllByRole('button', {
      name: /item 1/i,
    });
    expect(pageOneButton).toHaveLength(2);
    const pageTwoButton = screen.getAllByRole('button', {
      name: /item 2/i,
    });
    expect(pageTwoButton).toHaveLength(2);
    const pageThreeButton = screen.getAllByRole('button', {
      name: /item 3/i,
    });
    expect(pageThreeButton).toHaveLength(2);
  });

  it('should display reviews for selected page', async () => {
    const pageSize = DEFAULT_REVIEWS_PAGE_SIZE;
    const { venue, reviews } = seedVenueWithReviews(pageSize * 3);
    const { getLoaderSpinner, selectPageButton } = await renderComponent({
      venue,
    });

    await waitForElementToBeRemoved(getLoaderSpinner);
    reviews.slice(0, pageSize).forEach((review) => {
      expect(screen.getByText(review.reviewTitle)).toBeInTheDocument();
    });
    await selectPageButton(/item 2/);
    reviews.slice(pageSize, pageSize * 2).forEach((review) => {
      expect(screen.getByText(review.reviewTitle)).toBeInTheDocument();
    });
    await selectPageButton(/next/);
    reviews.slice(pageSize * 2, pageSize * 3).forEach((review) => {
      expect(screen.getByText(review.reviewTitle)).toBeInTheDocument();
    });
  });

  it('should display edit + delete when current user = review author + authenticated', async () => {
    const todaysDate = new Date().toISOString();
    const { venue, user: reviewAuthor } = seedVenueWithReviews(1, {
      createdAt: todaysDate,
    });

    getCurrentUserMock.mockResolvedValue({
      id: reviewAuthor.userId,
      role: 'authenticated',
    });

    const { getLoaderSpinner, openReviewActionsMenu } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);
    await openReviewActionsMenu();

    expect(
      screen.getByRole('menuitem', { name: /edit review/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /delete review/i })
    ).toBeInTheDocument();
  });

  it('should hide edit when review is older than 48h', async () => {
    const date48hAgo = subHours(new Date(), 48).toISOString();
    const { venue, user: reviewAuthor } = seedVenueWithReviews(1, {
      createdAt: date48hAgo,
    });
    getCurrentUserMock.mockResolvedValue({
      id: reviewAuthor.userId,
      role: 'authenticated',
    });

    const { getLoaderSpinner, openReviewActionsMenu } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);

    await openReviewActionsMenu();

    expect(
      screen.queryByRole('menuitem', { name: /edit review/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /delete review/i })
    ).toBeInTheDocument();
  });

  it('should hide edit + delete when user is not the author', async () => {
    const { venue } = seedVenueWithReviews(1);

    const { getLoaderSpinner, openReviewActionsMenu } = await renderComponent({
      venue,
    });
    await waitForElementToBeRemoved(getLoaderSpinner);
    await openReviewActionsMenu();

    expect(
      screen.queryByRole('menuitem', { name: /edit review/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: /delete review/i })
    ).not.toBeInTheDocument();
  });

  it('should delete review when selected by author', async () => {
    const { venue, user: reviewAuthor } = seedVenueWithReviews(
      DEFAULT_REVIEWS_PAGE_SIZE
    );
    getCurrentUserMock.mockResolvedValue({
      id: reviewAuthor.userId,
      role: 'authenticated',
    });
    const {
      getLoaderSpinner,
      openReviewActionsMenu,
      getVisibleReviewCards,
      user,
    } = await renderComponent({
      venue,
    });

    await waitForElementToBeRemoved(getLoaderSpinner);
    await openReviewActionsMenu();
    await user.click(screen.getByRole('menuitem', { name: /delete review/i }));
    await waitForElementToBeRemoved(
      screen.queryByRole('menu', { name: /review actions/i })
    );
    expect(
      screen.getByText(/are you sure you want to delete this review/i)
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: /confirm dialog action/i })
    );
    const visibleReviewCards = getVisibleReviewCards();
    expect(visibleReviewCards).toHaveLength(DEFAULT_REVIEWS_PAGE_SIZE - 1);
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

  const user = userEvent.setup();

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
    await waitForElementToBeRemoved(getLoaderSpinner);

    await user.click(screen.getByRole('button', { name: /sort by/i }));
    await user.click(screen.getByRole('option', { name: sortOption }));
    await waitForElementToBeRemoved(
      screen.queryByRole('listbox', { name: /sort by/i })
    );
  };

  const selectPageButton = async (pageButton: RegExp | string) => {
    const paginationContainer = screen.getAllByLabelText(/pagination/i);
    const topPagination = within(paginationContainer[0]);
    await user.click(topPagination.getByRole('button', { name: pageButton }));
  };

  const openReviewActionsMenu = async () => {
    const reviewCard = within(getVisibleReviewCards()[0]);
    await user.click(
      reviewCard.getByRole('button', { name: /open review actions/i })
    );
  };

  return {
    getLoaderSpinner,
    getVisibleReviewCards,
    getHeatRatingsInDomOrder,
    selectSortOption,
    selectPageButton,
    openReviewActionsMenu,
    user,
  };
};
