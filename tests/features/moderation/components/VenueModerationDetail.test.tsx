import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VenueModerationDetail from '@/features/moderation/components/VenueModerationDetail';
import { ModerationVenue } from '@/types/venueTypes';
import AllProviders from 'tests/AllProviders';
import {
  getModerationVenueMock,
  insertModerationNotificationMock,
  updateModerationImageStatusesMock,
  updateModerationVenueMock,
  updateModerationVenueStatusMock,
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
    insertModerationNotificationMock.mockResolvedValue({
      createdAt: '2026-01-01T12:00:00.000Z',
      linkUrl: null,
      message: 'Your venue is live',
      notificationId: 'notification-test-id',
      notificationStatus: 'unread',
      relatedType: 'venue',
      requestStatus: 'confirmed',
      title: 'Venue approved',
      userId: 'submitter-user-id',
      venueId: 'venue-test-id',
    });
    updateModerationImageStatusesMock.mockResolvedValue();
    updateModerationVenueMock.mockResolvedValue(createModerationVenue());
    updateModerationVenueStatusMock.mockResolvedValue();
  });

  it('loads the venue by route id and renders moderation detail metadata', async () => {
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    expect(getModerationVenueMock).toHaveBeenCalledWith('venue-test-id');
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getByText('pepper_admin')).toBeInTheDocument();
    expect(screen.getByText('submitter-user-id')).toBeInTheDocument();
    expect(screen.getByText(/01 May 2026/)).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(screen.getAllByText(/submitted venue waiting/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getByText('Mexican')).toBeInTheDocument();
    expect(screen.getByText('Vegan options')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('submits selected venue image status decisions', async () => {
    const user = userEvent.setup();
    getModerationVenueMock.mockResolvedValue(
      createModerationVenue({
        venueImages: [
          {
            altText: 'Front of Pepper Palace',
            createdAt: '2026-05-01T10:05:00.000Z',
            imageId: 'image-1',
            imagePath: {
              lg: 'image-1-lg.jpg',
              md: 'image-1-md.jpg',
              sm: 'image-1-sm.jpg',
            },
            imageType: 'venue',
            reviewId: null,
            status: 'pending',
            userId: 'submitter-user-id',
            venueId: 'venue-test-id',
          },
          {
            altText: 'Pepper Palace menu',
            createdAt: '2026-05-01T10:06:00.000Z',
            imageId: 'image-2',
            imagePath: {
              lg: 'image-2-lg.jpg',
              md: 'image-2-md.jpg',
              sm: 'image-2-sm.jpg',
            },
            imageType: 'venue',
            reviewId: null,
            status: 'pending',
            userId: 'submitter-user-id',
            venueId: 'venue-test-id',
          },
        ],
      })
    );

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getAllByLabelText(/approve image/i)[0]);
    await user.click(screen.getAllByLabelText(/decline image/i)[1]);
    await user.click(screen.getByRole('button', { name: /update images/i }));

    await waitFor(() => {
      expect(updateModerationImageStatusesMock).toHaveBeenCalledWith({
        approvedImageIds: ['image-1'],
        declinedImageIds: ['image-2'],
      });
    });
  });

  it('opens moderation images in the full-size carousel', async () => {
    const user = userEvent.setup();
    getModerationVenueMock.mockResolvedValue(
      createModerationVenue({
        venueImages: [
          {
            altText: 'Front of Pepper Palace',
            createdAt: '2026-05-01T10:05:00.000Z',
            imageId: 'image-1',
            imagePath: {
              lg: 'image-1-lg.jpg',
              md: 'image-1-md.jpg',
              sm: 'image-1-sm.jpg',
            },
            imageType: 'venue',
            reviewId: null,
            status: 'pending',
            userId: 'submitter-user-id',
            venueId: 'venue-test-id',
          },
          {
            altText: 'Pepper Palace menu',
            createdAt: '2026-05-01T10:06:00.000Z',
            imageId: 'image-2',
            imagePath: {
              lg: 'image-2-lg.jpg',
              md: 'image-2-md.jpg',
              sm: 'image-2-sm.jpg',
            },
            imageType: 'venue',
            reviewId: null,
            status: 'pending',
            userId: 'submitter-user-id',
            venueId: 'venue-test-id',
          },
        ],
      })
    );

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /open full-size image: pepper palace menu/i,
      })
    );

    await waitFor(
      () => {
        const fullSizeImages = screen
          .getAllByRole('img', { name: /pepper palace menu/i })
          .filter((image) =>
            image.getAttribute('src')?.endsWith('image-2-lg.jpg')
          );

        expect(fullSizeImages).toHaveLength(1);
      },
      { timeout: 5_000 }
    );
  });

  it('approves a venue submission', async () => {
    const user = userEvent.setup();
    getModerationVenueMock.mockResolvedValue(
      createModerationVenue({ venueImages: [] })
    );

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /approve venue/i }));

    await waitFor(() => {
      expect(updateModerationVenueStatusMock).toHaveBeenCalledWith({
        venueId: 'venue-test-id',
        status: 'approved',
      });
    });
  });

  it('approves a pending venue, snapshots fields, and sends the notification payload', async () => {
    const user = userEvent.setup();
    const expectedVenueLink =
      'https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id';
    const expectedMessage = [
      'Good news - your venue Pepper Palace has been approved.',
      `You can find the venue here: ${expectedVenueLink}`,
    ].join(' ');
    getModerationVenueMock.mockResolvedValue(
      createModerationVenue({ venueImages: [] })
    );

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /approve venue/i }));

    expect(
      await screen.findByRole('heading', { name: /send notification/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/pepper_admin.*submitter-user-id/i)
    ).toBeInTheDocument();
    expect(screen.getByText('venue')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
    expect(screen.getAllByText('Pepper Palace').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/title/i)).toHaveDisplayValue(
      'Yay, Pepper Palace is live!'
    );

    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(updateModerationVenueStatusMock).toHaveBeenCalledWith({
        venueId: 'venue-test-id',
        status: 'approved',
      });
      expect(insertModerationNotificationMock).toHaveBeenCalledWith({
        userId: 'submitter-user-id',
        relatedType: 'venue',
        title: 'Yay, Pepper Palace is live!',
        message: expectedMessage,
        linkUrl: expectedVenueLink,
        venueId: 'venue-test-id',
        requestStatus: 'confirmed',
      });
    });
  });

  it('does not approve a pending venue until pending images have decisions', async () => {
    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/resolve all pending image decisions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /approve venue/i })
    ).toBeDisabled();
    expect(updateModerationVenueStatusMock).not.toHaveBeenCalled();
  });

  it('updates pending image decisions before approving a venue submission', async () => {
    const user = userEvent.setup();

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText(/approve image/i));
    await user.click(screen.getByRole('button', { name: /approve venue/i }));

    await waitFor(() => {
      expect(updateModerationImageStatusesMock).toHaveBeenCalledWith({
        approvedImageIds: ['image-1'],
        declinedImageIds: [],
      });
    });
    await waitFor(() => {
      expect(updateModerationVenueStatusMock).toHaveBeenCalledWith({
        venueId: 'venue-test-id',
        status: 'approved',
      });
    });
  });

  it('declines a venue submission', async () => {
    const user = userEvent.setup();

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /decline venue/i }));

    await waitFor(() => {
      expect(updateModerationVenueStatusMock).toHaveBeenCalledWith({
        venueId: 'venue-test-id',
        status: 'declined',
      });
    });
  });

  it('declines a venue with the declined template and no link', async () => {
    const user = userEvent.setup();

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /decline venue/i }));

    expect(
      await screen.findByRole('heading', { name: /send notification/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveDisplayValue(
      'Update on Pepper Palace'
    );
    expect(screen.getByText('declined')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(insertModerationNotificationMock).toHaveBeenCalledWith({
        userId: 'submitter-user-id',
        relatedType: 'venue',
        title: 'Update on Pepper Palace',
        message:
          'Thanks for submitting Pepper Palace. We could not approve it this time, but you can make changes and try again.',
        linkUrl: null,
        venueId: 'venue-test-id',
        requestStatus: 'declined',
      });
    });
  });

  it('keeps the inline composer mounted with retry when notification sending fails', async () => {
    const user = userEvent.setup();
    getModerationVenueMock.mockResolvedValue(
      createModerationVenue({ venueImages: [] })
    );
    insertModerationNotificationMock
      .mockRejectedValueOnce(new Error('RPC failed'))
      .mockResolvedValueOnce({
        createdAt: '2026-01-01T12:00:00.000Z',
        linkUrl: null,
        message: 'Your venue is live',
        notificationId: 'notification-test-id',
        notificationStatus: 'unread',
        relatedType: 'venue',
        requestStatus: 'confirmed',
        title: 'Venue approved',
        userId: 'submitter-user-id',
        venueId: 'venue-test-id',
      });

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /approve venue/i }));
    await user.click(
      await screen.findByRole('button', { name: /send notification/i })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('RPC failed');
    expect(
      screen.getByRole('heading', { name: /send notification/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(insertModerationNotificationMock).toHaveBeenCalledTimes(2);
    });
    expect(updateModerationVenueStatusMock).toHaveBeenCalledTimes(1);
  });

  it('submits corrected venue fields', async () => {
    const user = userEvent.setup();
    const originalVenue = createModerationVenue();
    const updatedVenue = createModerationVenue({
      cuisines: ['Thai', 'Korean'],
      phoneNumber: '+449999888777',
      venueName: 'Pepper House',
      venueNameSlug: 'pepper-house',
    });

    getModerationVenueMock
      .mockResolvedValueOnce(originalVenue)
      .mockResolvedValue(updatedVenue);
    updateModerationVenueMock.mockResolvedValue(updatedVenue);

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^venue name$/i));
    await user.type(screen.getByLabelText(/^venue name$/i), 'Pepper House');
    await user.clear(screen.getByLabelText(/^venue slug$/i));
    await user.type(screen.getByLabelText(/^venue slug$/i), 'pepper-house');
    await user.clear(screen.getByLabelText(/^phone number$/i));
    await user.type(screen.getByLabelText(/^phone number$/i), '+44 9999 888777');
    await user.clear(screen.getByLabelText(/^cuisines$/i));
    await user.type(screen.getByLabelText(/^cuisines$/i), 'Thai, Korean');
    await user.click(
      screen.getByRole('button', { name: /save venue changes/i })
    );

    await waitFor(() => {
      expect(updateModerationVenueMock).toHaveBeenCalledWith({
        venueId: 'venue-test-id',
        venueUpdate: expect.objectContaining({
          cuisines: ['Thai', 'Korean'],
          phoneNumber: '+449999888777',
          venueName: 'Pepper House',
          venueNameSlug: 'pepper-house',
        }),
      });
    });
    expect(
      await screen.findByRole('heading', { name: /pepper house/i })
    ).toBeInTheDocument();
  });

  it('submits edited venue fields when the website does not include a protocol', async () => {
    const user = userEvent.setup();
    getModerationVenueMock.mockResolvedValue(
      createModerationVenue({ website: 'example.com' })
    );

    renderDetail();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^venue name$/i));
    await user.type(screen.getByLabelText(/^venue name$/i), 'Pepper Rooms');
    await user.click(
      screen.getByRole('button', { name: /save venue changes/i })
    );

    await waitFor(() => {
      expect(updateModerationVenueMock).toHaveBeenCalledWith({
        venueId: 'venue-test-id',
        venueUpdate: expect.objectContaining({
          venueName: 'Pepper Rooms',
          website: 'example.com',
        }),
      });
    });
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
