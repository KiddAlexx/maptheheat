import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { deleteReviewMock, getReviewsMock } from './mocks/apiReviews';
import { getCurrentUserMock } from './mocks/apiAuth';
import { getUserProfileMock } from './mocks/apiUserProfiles';
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
