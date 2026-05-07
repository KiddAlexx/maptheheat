import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VenueModerationDetail from '@/features/moderation/components/VenueModerationDetail';
import { ModerationVenue } from '@/types/venueTypes';
import AllProviders from 'tests/AllProviders';
import { getModerationVenueMock } from 'tests/mocks/apiModeration';

function createModerationVenue(
  overrides: Partial<ModerationVenue> = {}
): ModerationVenue {
  return {
    address: '1 Pepper Street',
    city: 'London',
    coords: { lat: 51.5072, lon: -0.1276 },
    country: 'United Kingdom',
    createdAt: '2026-05-01T10:00:00.000Z',
    cuisines: ['Mexican'],
    description: 'A submitted venue waiting for moderation.',
    detailedAddress: '1 Pepper Street, London',
    dietaryOptions: ['Vegan options'],
    phoneNumber: '+44 1234 567890',
    postcode: 'SW1A 1AA',
    status: 'pending',
    submitterUsername: 'pepper_admin',
    userId: 'submitter-user-id',
    venueId: 'venue-test-id',
    venueImages: [
      {
        altText: 'Front of Pepper Palace',
        createdAt: '2026-05-01T10:05:00.000Z',
        imageId: 'image-1',
        imagePath: {
          lg: 'image-lg.jpg',
          md: 'image-md.jpg',
          sm: 'image-sm.jpg',
        },
        imageType: 'venue',
        reviewId: null,
        status: 'pending',
        userId: 'submitter-user-id',
        venueId: 'venue-test-id',
      },
    ],
    venueName: 'Pepper Palace',
    venueNameSlug: 'pepper-palace',
    venueType: 'restaurant',
    website: 'https://example.com',
    ...overrides,
  };
}

function renderDetail(path = '/admin/moderation/venues/venue-test-id') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin/moderation/venues/:venueId"
          element={<VenueModerationDetail />}
        />
        <Route
          path="/admin/moderation/venues"
          element={<VenueModerationDetail />}
        />
      </Routes>
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('VenueModerationDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModerationVenueMock.mockResolvedValue(createModerationVenue());
  });

  it('loads the venue by route id and renders moderation detail metadata', async () => {
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    expect(getModerationVenueMock).toHaveBeenCalledWith('venue-test-id');
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('pepper_admin')).toBeInTheDocument();
    expect(screen.getByText('submitter-user-id')).toBeInTheDocument();
    expect(screen.getByText(/01 May 2026/)).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(screen.getByText(/submitted venue waiting/i)).toBeInTheDocument();
    expect(screen.getByText('Mexican')).toBeInTheDocument();
    expect(screen.getByText('Vegan options')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders an error state when the venue cannot be loaded', async () => {
    getModerationVenueMock.mockRejectedValue(new Error('Not allowed'));

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /venue submission could not be loaded/i
    );
    expect(
      screen.getByRole('link', { name: /back to venue queue/i })
    ).toHaveAttribute('href', '/admin/moderation/venues');
  });

  it('renders a not found state when no venue id is present', async () => {
    renderDetail('/admin/moderation/venues');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /venue submission not found/i
      );
    });
  });
});
