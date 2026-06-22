export interface Profile {
  userId: string;
  updatedAt: string | null;
  username: string | null;
  avatarUrl: string;
  totalReviews: number | null;
  totalVenuesAdded: number | null;
  isPublic: boolean;
  showFavourites: boolean;
  createdAt: string | null;
}

export type NotificationRelatedType = 'review' | 'venue' | 'image';

export type NotificationRequestStatus = 'pending' | 'confirmed' | 'declined';

export type NotificationStatus = 'read' | 'unread' | 'deleted';

export interface UserNotification {
  notificationId: string;
  createdAt: string;
  relatedType: NotificationRelatedType;
  title: string;
  message: string;
  linkUrl: string | null;
  venueId: string | null;
  userId: string;
  notificationStatus: NotificationStatus;
  requestStatus: NotificationRequestStatus;
}

export interface AdminNotificationPayload {
  userId: string;
  relatedType: NotificationRelatedType;
  title: string;
  message: string;
  linkUrl?: string | null;
  venueId?: string | null;
  notificationStatus?: Extract<NotificationStatus, 'read' | 'unread'>;
  requestStatus?: NotificationRequestStatus;
}

export interface ModerationNotificationRecipient {
  userId: string;
  username: string | null;
}
