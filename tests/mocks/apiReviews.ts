import { ReviewsRequestParams } from '@/services/apiReviews';
import { db } from './db';

export async function getReviewsMock({
  venueId,
  userId,
  pagination,
}: ReviewsRequestParams) {
  let rows = db.review.getAll();

  if (venueId) rows = rows.filter((r) => r.venueId === venueId);
  if (userId) rows = rows.filter((r) => r.userId === userId);

  const pageNumber = pagination?.pageNumber ?? 1;
  const maxResults = pagination?.maxResults ?? 10;
  const from = (pageNumber - 1) * maxResults;
  const to = from + maxResults;

  const page = rows.slice(from, to);

  return { reviews: page, count: rows.length };
}

export async function deleteReviewMock(reviewId: string) {
  if (!reviewId) return;
  db.review.delete({
    where: { reviewId: { equals: reviewId } },
  });
}
