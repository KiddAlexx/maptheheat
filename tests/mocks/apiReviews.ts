import { ReviewsRequestParams } from '@/services/apiReviews';
import { delay } from 'msw';
import { db } from './db';
import { vi } from 'vitest';

export const getReviewsAction = vi.fn(
  async ({ venueId, userId, pagination, sort }: ReviewsRequestParams) => {
    let rows = db.review.getAll();

    if (venueId) rows = rows.filter((r) => r.venueId === venueId);
    if (userId) rows = rows.filter((r) => r.userId === userId);

    //  apply sort
    if (sort?.field && sort?.direction) {
      const dir = sort.direction === 'asc' ? 1 : -1;

      rows = [...rows].sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];

        // numbers (heatRating/qualityRating)
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * dir;
        }

        // dates (createdAt as ISO string)
        if (sort.field === 'createdAt') {
          return (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * dir;
        }

        return 0;
      });
    }

    const pageNumber = pagination?.pageNumber ?? 1;
    const maxResults = pagination?.maxResults ?? 10;
    const from = (pageNumber - 1) * maxResults;
    const to = from + maxResults;

    return { reviews: rows.slice(from, to), count: rows.length };
  }
);

export const getReviewsMock = vi.fn(getReviewsAction);

export const simulateReviewsDelay = (ms = 50) => {
  getReviewsMock.mockImplementationOnce(async (params) => {
    await delay(ms);
    return getReviewsAction(params);
  });
};

export const simulateReviewsError = (
  message = 'Error: Failed to fetch reviews'
) => {
  getReviewsMock.mockRejectedValueOnce(new Error(message));
};

export const deleteReviewMock = vi.fn(async (reviewId: string) => {
  if (!reviewId) return;
  db.review.delete({ where: { reviewId: { equals: reviewId } } });
});
