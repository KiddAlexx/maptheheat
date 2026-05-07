import { vi } from 'vitest';
import {
  ModerationVenuesResponse,
  UpdateModerationImageStatusesArgs,
  UpdateModerationVenueArgs,
  UpdateVenueModerationStatusArgs,
} from '@/services/apiModeration';
import { ModerationVenue, UniqueCity } from '@/types/venueTypes';

export const getIsAdminMock = vi.fn(async () => false);
export const getModerationVenuesMock = vi.fn<
  () => Promise<ModerationVenuesResponse>
>(async () => ({
  data: [],
  count: 0,
}));
export const getModerationVenueMock = vi.fn<() => Promise<ModerationVenue>>();
export const getModerationCitiesMock = vi.fn<() => Promise<UniqueCity[]>>(
  async () => []
);
export const updateVenueModerationStatusMock = vi.fn<
  (args: UpdateVenueModerationStatusArgs) => Promise<void>
>();
export const updateModerationVenueMock = vi.fn<
  (args: UpdateModerationVenueArgs) => Promise<ModerationVenue>
>();
export const updateModerationImageStatusesMock = vi.fn<
  (args: UpdateModerationImageStatusesArgs) => Promise<void>
>();
