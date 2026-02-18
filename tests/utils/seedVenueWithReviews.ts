import { db } from 'tests/mocks/db';

export const seedVenueWithReviews = (count: number, options?: object) => {
  const venue = db.venue.create();
  const user = db.profile.create();

  const reviews = Array.from({ length: count }, () =>
    db.review.create({
      venueId: venue.venueId,
      venueDetails: venue,
      profiles: user,
      ...options,
    })
  );

  return { venue, user, reviews };
};
