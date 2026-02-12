import { it, expect, describe } from 'vitest';
import { logRoles, screen } from '@testing-library/react';

import ReviewContainer from '@/features/reviews/components/ReviewContainer';
import { db } from 'tests/mocks/db';

import { renderWithRoute } from 'tests/utils/renderWithRoute';
import { drop } from '@mswjs/data';
import { seedVenueWithReviews } from 'tests/utils/seedVenueWithReviews';

type DbVenue = ReturnType<typeof db.venue.create>;

describe('ReviewContainer', () => {
  beforeEach(() => {
    drop(db);
  });

  it('it should render review heading', async () => {
    const { venue } = seedVenueWithReviews(5);
    const { heading } = await renderComponent({ venue });
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

  const getLoaderSpinner = () =>
    screen.queryByRole('status', {
      name: /loading reviews/i,
    });

  screen.debug(undefined, Infinity);
  logRoles(document.body);
  return { heading, getLoaderSpinner };
};
