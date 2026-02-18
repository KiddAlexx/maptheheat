import { db } from './db';

export const getUserProfileMock = vi.fn(async (userId: string) => {
  if (!userId) return;

  return db.profile.findFirst({ where: { userId: { equals: userId } } });
});
