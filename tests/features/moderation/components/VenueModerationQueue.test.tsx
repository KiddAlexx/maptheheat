import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VenueModerationQueue from '@/features/moderation/components/VenueModerationQueue';
import { ModerationVenue } from '@/types/venueTypes';
import AllProviders from 'tests/AllProviders';
import {
  getModerationCitiesMock,
  getModerationVenuesMock,
} from 'tests/mocks/apiModeration';

function createModerationVenue(
  overrides: Partial<ModerationVenue> = {}
): ModerationVenue {
  return {
    address: '1 Pepper Street',
    city: 'London',
    coords: { lat: 51.5072, lon: -0.1276 },
    country: 'United Kingdom',
    createdAt: '2026-05-01T10:00:00.000Z',
    description: 'A submitted venue waiting for moderation.',
    detailedAddress: '1 Pepper Street, London',
    phoneNumber: '+44 1234 567890',
    postcode: 'SW1A 1AA',
    status: 'pending',
    submitterUsername: 'pepper_admin',
    userId: 'submitter-user-id',
    venueId: 'venue-test-id',
    venueImages: [],
    venueName: 'Pepper Palace',
    venueNameSlug: 'pepper-palace',
    venueType: 'restaurant',
    website: 'https://example.com',
    ...overrides,
  };
}

function renderQueue() {
  return render(
    <MemoryRouter>
      <VenueModerationQueue />
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('VenueModerationQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModerationCitiesMock.mockResolvedValue([
      {
        cityId: 'london',
        city: 'London',
        country: 'United Kingdom',
        coords: { lat: 51.5072, lon: -0.1276 },
      },
    ]);
    getModerationVenuesMock.mockResolvedValue({
      data: [createModerationVenue()],
      count: 1,
    });
  });

  it('renders moderation status filters and pending venues by default', async () => {
    renderQueue();

    expect(
      screen.getByRole('heading', { name: /venue moderation/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pending/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /approved/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /declined/i })).toBeInTheDocument();

    expect(await screen.findByText(/pepper palace/i)).toBeInTheDocument();
    expect(screen.getByText(/pepper_admin/i)).toBeInTheDocument();
    expect(screen.getByText(/submitter-user-id/i)).toBeInTheDocument();

    expect(getModerationVenuesMock).toHaveBeenCalledWith({
      status: 'pending',
      filters: [],
      sort: undefined,
      pagination: { pageNumber: 1, maxResults: 8 },
    });
  });

  it('uses moderation cities for the city filter', async () => {
    const user = userEvent.setup();
    renderQueue();

    const citySelect = await screen.findByLabelText(/city/i);

    expect(screen.getByRole('option', { name: /all cities/i })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: /london - united kingdom/i })
    ).toBeInTheDocument();

    await user.selectOptions(citySelect, 'London|United Kingdom');

    await waitFor(() => {
      expect(getModerationVenuesMock).toHaveBeenLastCalledWith({
        status: 'pending',
        filters: [
          { field: 'city', value: 'London', method: 'eq' },
          { field: 'country', value: 'United Kingdom', method: 'eq' },
        ],
        sort: undefined,
        pagination: { pageNumber: 1, maxResults: 8 },
      });
    });
  });

  it('links venue rows to the moderation detail route', async () => {
    renderQueue();

    const venueLink = await screen.findByRole('link', {
      name: /pepper palace/i,
    });

    expect(venueLink).toHaveAttribute(
      'href',
      '/admin/moderation/venues/venue-test-id'
    );
  });
});
