export interface Profile {
  userId: string;
  updatedAt: string | null;
  username: string | null;
  avatarUrl: string;
  totalReviews: number | null;
  totalVenuesAdded: number | null;
  favouriteVenues: string[] | null;
}

export interface UserNotification {
  notificationId: string;
  createdAt: string;
  relatedType: 'review' | 'venue' | 'image';
  title: string;
  message: string;
  linkUrl: string;
  venueId: string;
  userId: string;
  notificationStatus: 'read' | 'unread' | 'deleted';
  requestStatus: 'pending' | 'confirmed' | ' declined';
}
