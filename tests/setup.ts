import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { deleteReviewMock, getReviewsMock } from './mocks/apiReviews';
import { getCurrentUserMock } from './mocks/apiAuth';
import { getUserProfileMock } from './mocks/apiUserProfiles';

// mock supabase api functions
vi.mock('@/services/apiReviews', () => ({
  getReviews: getReviewsMock,
  deleteReviewApi: deleteReviewMock,
}));

vi.mock('@/services/apiAuth', () => ({
  getCurrentUser: getCurrentUserMock,
}));

vi.mock('@/services/apiUserProfiles', () => ({
  getUserProfile: getUserProfileMock,
}));

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
