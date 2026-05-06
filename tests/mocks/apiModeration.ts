import { vi } from 'vitest';

export const getIsAdminMock = vi.fn(async () => false);
export const getModerationVenuesMock = vi.fn(async () => ({
  data: [],
  count: 0,
}));
export const getModerationVenueMock = vi.fn();
export const getModerationCitiesMock = vi.fn(async () => []);
export const updateVenueModerationStatusMock = vi.fn();
export const updateModerationVenueMock = vi.fn();
export const updateModerationImageStatusesMock = vi.fn();
