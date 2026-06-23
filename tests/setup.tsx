import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { deleteReviewMock, getReviewsMock } from './mocks/apiReviews';
import {
  clearLocalSessionApiMock,
  getCurrentUserMock,
  logoutApiMock,
} from './mocks/apiAuth';
import {
  getIsAdminMock,
  getModerationCitiesMock,
  getModerationReviewMock,
  getModerationReviewsMock,
  getModerationStandaloneImageGroupMock,
  getModerationStandaloneImagesMock,
  getModerationVenueMock,
  getModerationVenuesMock,
  insertModerationNotificationMock,
  searchModerationNotificationRecipientsMock,
  setVenueThumbnailMock,
  updateModerationImageStatusesMock,
  updateModerationReviewMock,
  updateModerationReviewStatusMock,
  updateModerationVenueMock,
  updateModerationVenueStatusMock,
} from './mocks/apiModeration';
import {
  deleteAccountMock,
  getUnreadNotificationsCountMock,
  getUserProfileMock,
} from './mocks/apiUserProfiles';
import React from 'react';

// mock supabase api functions
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({})),
}));

vi.mock('@/services/apiReviews', () => ({
  getReviews: getReviewsMock,
  deleteReviewApi: deleteReviewMock,
}));

vi.mock('@/services/apiAuth', () => ({
  clearLocalSessionApi: clearLocalSessionApiMock,
  getCurrentUser: getCurrentUserMock,
  logoutApi: logoutApiMock,
}));

vi.mock('@/services/apiModeration', () => ({
  getIsAdmin: getIsAdminMock,
  getModerationVenues: getModerationVenuesMock,
  getModerationVenue: getModerationVenueMock,
  getModerationReviews: getModerationReviewsMock,
  getModerationReview: getModerationReviewMock,
  getModerationStandaloneImages: getModerationStandaloneImagesMock,
  getModerationStandaloneImageGroup: getModerationStandaloneImageGroupMock,
  getModerationCities: getModerationCitiesMock,
  searchModerationNotificationRecipients:
    searchModerationNotificationRecipientsMock,
  insertModerationNotification: insertModerationNotificationMock,
  updateModerationVenueStatus: updateModerationVenueStatusMock,
  updateModerationVenue: updateModerationVenueMock,
  updateModerationReviewStatus: updateModerationReviewStatusMock,
  updateModerationReview: updateModerationReviewMock,
  updateModerationImageStatuses: updateModerationImageStatusesMock,
  setVenueThumbnail: setVenueThumbnailMock,
}));

vi.mock('@/services/apiUserProfiles', () => ({
  deleteAccount: deleteAccountMock,
  getUserProfile: getUserProfileMock,
  getUnreadNotificationsCount: getUnreadNotificationsCountMock,
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];

  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}

window.IntersectionObserver = MockIntersectionObserver;

class MockResizeObserver implements ResizeObserver {
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();
}

window.ResizeObserver = MockResizeObserver;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

if (
  typeof SVGElement !== 'undefined' &&
  !('getBBox' in SVGElement.prototype)
) {
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    configurable: true,
    writable: true,
    value: () => ({
      x: 0,
      y: 0,
      width: 24,
      height: 24,
    }),
  });
}

vi.mock('focus-trap-react', () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});
