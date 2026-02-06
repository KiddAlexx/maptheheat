import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import ReviewContainer from '@/features/reviews/components/ReviewContainer';
import { db } from 'tests/mocks/db';

import { renderWithRoute } from 'tests/utils';

type DbVenue = ReturnType<typeof db.venue.create>;

describe('ReviewContainer', () => {
  const reviewIds: string[] = [];
  const userIds: string[] = [];
  let venue1: DbVenue;

  beforeAll(() => {
    const venue = db.venue.create();
    venue1 = venue;

    const user = db.profile.create();
    userIds.push(user.userId);

    [1, 2, 3, 4, 5].forEach(() => {
      const review = db.review.create({
        venueId: venue.venueId,
        venueDetails: venue,
        profiles: user,
      });
      reviewIds.push(review.reviewId);
    });
  });

  afterAll(() => {
    db.review.deleteMany({ where: { reviewId: { in: reviewIds } } });
    db.venue.deleteMany({ where: { venueId: { equals: venue1.venueId } } });
    db.profile.deleteMany({ where: { userId: { in: userIds } } });
  });

  it('it should render review heading', async () => {
    const { heading } = await renderComponent({ venue: venue1 });
    expect(heading).toBeInTheDocument();
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

  const heading = await screen.findByRole('heading', { name: /reviews/i });
  screen.debug(undefined, Infinity);
  return { heading };
};
