import { vi } from 'vitest';
import {
  AdminNotificationPayload,
  ModerationNotificationRecipient,
  UserNotification,
} from '@/types/userTypes';
import {
  ModerationStandaloneImagesResponse,
  ModerationReviewsResponse,
  ModerationVenuesResponse,
  SetVenueThumbnailArgs,
  UpdateModerationImageStatusesArgs,
  UpdateModerationReviewArgs,
  UpdateModerationReviewStatusArgs,
  UpdateModerationVenueArgs,
  UpdateModerationVenueStatusArgs,
} from '@/services/apiModeration';
import { ModerationReview } from '@/types/reviewTypes';
import {
  ModerationStandaloneImageGroup,
  ModerationVenue,
  UniqueCity,
} from '@/types/venueTypes';

export const getIsAdminMock = vi.fn(async () => false);
export const getModerationVenuesMock = vi.fn<
  () => Promise<ModerationVenuesResponse>
>(async () => ({
  data: [],
  count: 0,
}));
export const getModerationVenueMock = vi.fn<() => Promise<ModerationVenue>>();
export const getModerationReviewsMock = vi.fn<
  () => Promise<ModerationReviewsResponse>
>(async () => ({
  data: [],
  count: 0,
}));
export const getModerationReviewMock = vi.fn<() => Promise<ModerationReview>>();
export const getModerationStandaloneImagesMock = vi.fn<
  () => Promise<ModerationStandaloneImagesResponse>
>(async () => ({
  data: [],
  count: 0,
}));
export const getModerationStandaloneImageGroupMock = vi.fn<
  () => Promise<ModerationStandaloneImageGroup>
>();
export const getModerationCitiesMock = vi.fn<() => Promise<UniqueCity[]>>(
  async () => []
);
export const searchModerationNotificationRecipientsMock = vi.fn<
  (query: string) => Promise<ModerationNotificationRecipient[]>
>(async () => []);
export const insertModerationNotificationMock = vi.fn<
  (payload: AdminNotificationPayload) => Promise<UserNotification>
>();
export const updateModerationVenueStatusMock = vi.fn<
  (args: UpdateModerationVenueStatusArgs) => Promise<void>
>();
export const updateModerationVenueMock = vi.fn<
  (args: UpdateModerationVenueArgs) => Promise<ModerationVenue>
>();
export const updateModerationReviewStatusMock = vi.fn<
  (args: UpdateModerationReviewStatusArgs) => Promise<void>
>();
export const updateModerationReviewMock = vi.fn<
  (args: UpdateModerationReviewArgs) => Promise<ModerationReview>
>();
export const updateModerationImageStatusesMock = vi.fn<
  (args: UpdateModerationImageStatusesArgs) => Promise<void>
>();
export const setVenueThumbnailMock = vi.fn<
  (args: SetVenueThumbnailArgs) => Promise<void>
>();
