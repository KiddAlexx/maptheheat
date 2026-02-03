import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { deleteReviewMock, getReviewsMock } from './mocks/apiReviews';

vi.mock('@/services/apiReviews', () => ({
  getReviews: getReviewsMock,
  deleteReviewApi: deleteReviewMock,
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
