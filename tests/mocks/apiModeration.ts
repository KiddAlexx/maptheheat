import { vi } from 'vitest';
import {
  ModerationReviewsResponse,
  ModerationVenuesResponse,
  UpdateModerationImageStatusesArgs,
  UpdateModerationReviewArgs,
  UpdateModerationVenueArgs,
  UpdateReviewModerationStatusArgs,
  UpdateVenueModerationStatusArgs,
} from '@/services/apiModeration';
import { ModerationReview } from '@/types/reviewTypes';
import { ModerationVenue, UniqueCity } from '@/types/venueTypes';

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
export const getModerationReviewCitiesMock = vi.fn<
  () => Promise<UniqueCity[]>
>(async () => []);
export const getModerationCitiesMock = vi.fn<() => Promise<UniqueCity[]>>(
  async () => []
);
export const updateVenueModerationStatusMock = vi.fn<
  (args: UpdateVenueModerationStatusArgs) => Promise<void>
>();
export const updateModerationVenueMock = vi.fn<
  (args: UpdateModerationVenueArgs) => Promise<ModerationVenue>
>();
export const updateReviewModerationStatusMock = vi.fn<
  (args: UpdateReviewModerationStatusArgs) => Promise<void>
>();
export const updateModerationReviewMock = vi.fn<
  (args: UpdateModerationReviewArgs) => Promise<ModerationReview>
>();
export const updateModerationImageStatusesMock = vi.fn<
  (args: UpdateModerationImageStatusesArgs) => Promise<void>
>();
