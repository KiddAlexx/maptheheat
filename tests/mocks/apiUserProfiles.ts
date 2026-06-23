import { vi } from 'vitest';
import { db } from './db';

export const getUserProfileMock = vi.fn(async (userId: string) => {
  if (!userId) return;

  return db.profile.findFirst({ where: { userId: { equals: userId } } });
});

export const getUnreadNotificationsCountMock = vi.fn(async () => 0);

export const deleteAccountMock = vi.fn(async (deleteReviews: boolean) => {
  void deleteReviews;
});
