import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StandaloneImageModerationQueue from '@/features/moderation/components/StandaloneImageModerationQueue';
import { ModerationStandaloneImageGroup } from '@/types/venueTypes';
import AllProviders from 'tests/AllProviders';
import { getModerationStandaloneImagesMock } from 'tests/mocks/apiModeration';

function createStandaloneImageGroup(
  overrides: Partial<ModerationStandaloneImageGroup> = {}
): ModerationStandaloneImageGroup {
  return {
    city: 'London',
    groupId: 'venue-test-id:submitter-user-id',
    imageCount: 2,
    images: [
      {
        altText: 'Standalone venue image',
        createdAt: '2026-05-01T10:05:00.000Z',
        imageId: 'image-1',
        imagePath: {
          lg: 'image-1-lg.jpg',
          md: 'image-1-md.jpg',
          sm: 'image-1-sm.jpg',
        },
        imageType: 'standalone',
        reviewId: null,
        status: 'pending',
        userId: 'submitter-user-id',
        venueId: 'venue-test-id',
      },
      {
        altText: 'Standalone venue menu',
        createdAt: '2026-05-01T10:06:00.000Z',
        imageId: 'image-2',
        imagePath: {
          lg: 'image-2-lg.jpg',
          md: 'image-2-md.jpg',
          sm: 'image-2-sm.jpg',
        },
        imageType: 'standalone',
        reviewId: null,
        status: 'pending',
        userId: 'submitter-user-id',
        venueId: 'venue-test-id',
      },
    ],
    lastCreatedAt: '2026-05-01T10:06:00.000Z',
    userId: 'submitter-user-id',
    username: 'pepper_admin',
    venueId: 'venue-test-id',
    venueName: 'Pepper Palace',
    venueNameSlug: 'pepper-palace',
    ...overrides,
  };
}

function renderQueue() {
  return render(
    <MemoryRouter>
      <StandaloneImageModerationQueue />
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('StandaloneImageModerationQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModerationStandaloneImagesMock.mockResolvedValue({
      data: [createStandaloneImageGroup()],
      count: 1,
    });
  });

  it('renders moderation status filters and pending image groups by default', async () => {
    renderQueue();

    expect(
      screen.getByRole('heading', { name: /image moderation/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pending/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /approved/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /declined/i })).toBeInTheDocument();

    expect(
      await screen.findByRole('link', { name: /pepper palace/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/2 pending of 2/i)).toBeInTheDocument();
    expect(screen.getByText(/pepper_admin/i)).toBeInTheDocument();
    expect(screen.getByText(/^submitter-user-id$/i)).toBeInTheDocument();
    expect(screen.getByText(/venue-test-id:submitter-user-id/i)).toBeInTheDocument();

    expect(getModerationStandaloneImagesMock).toHaveBeenCalledWith({
      status: 'pending',
      filters: [],
      pagination: { pageNumber: 1, maxResults: 8 },
    });
  });

  it('links image groups to the moderation detail route', async () => {
    renderQueue();

    const imageGroupLink = await screen.findByRole('link', {
      name: /pepper palace/i,
    });

    expect(imageGroupLink).toHaveAttribute(
      'href',
      '/admin/moderation/images/venue-test-id%3Asubmitter-user-id'
    );
  });

  it('requests approved image groups when the approved status filter is selected', async () => {
    const user = userEvent.setup();
    renderQueue();

    expect(
      await screen.findByRole('link', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /approved/i }));

    await waitFor(() => {
      expect(getModerationStandaloneImagesMock).toHaveBeenLastCalledWith({
        status: 'approved',
        filters: [],
        pagination: { pageNumber: 1, maxResults: 8 },
      });
    });
    expect(screen.getByRole('button', { name: /approved/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('adds venue and submitter search filters after submitting search fields', async () => {
    const user = userEvent.setup();
    renderQueue();

    expect(
      await screen.findByRole('link', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/venue/i), 'Pepper');
    await user.type(screen.getByLabelText(/submitter/i), 'pepper');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(getModerationStandaloneImagesMock).toHaveBeenLastCalledWith({
        status: 'pending',
        filters: [
          { field: 'venueName', value: '%Pepper%', method: 'ilike' },
          { field: 'username', value: '%pepper%', method: 'ilike' },
        ],
        pagination: { pageNumber: 1, maxResults: 8 },
      });
    });
  });
});
