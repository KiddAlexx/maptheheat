export interface Profile {
  userId: string;
  updatedAt: string | null;
  username: string | null;
  avatarUrl: string;
  totalReviews: number | null;
  totalVenuesAdded: number | null;
  favouriteVenues: string[] | null;
}
