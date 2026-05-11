import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StandaloneImageModerationGroup from '@/features/moderation/components/StandaloneImageModerationGroup';
import { ModerationStandaloneImageGroup } from '@/types/venueTypes';
import AllProviders from 'tests/AllProviders';
import {
  getModerationStandaloneImageGroupMock,
  insertModerationNotificationMock,
  updateModerationImageStatusesMock,
} from 'tests/mocks/apiModeration';

function createStandaloneImageGroup(
  overrides: Partial<ModerationStandaloneImageGroup> = {}
): ModerationStandaloneImageGroup {
  return {
    city: 'London',
    country: 'United Kingdom',
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

function renderGroup(path = '/admin/moderation/images/venue-test-id%3Asubmitter-user-id') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/admin/moderation/images/:groupId"
          element={<StandaloneImageModerationGroup />}
        />
        <Route
          path="/admin/moderation/images"
          element={<StandaloneImageModerationGroup />}
        />
      </Routes>
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('StandaloneImageModerationGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModerationStandaloneImageGroupMock.mockResolvedValue(
      createStandaloneImageGroup()
    );
    insertModerationNotificationMock.mockResolvedValue({
      createdAt: '2026-01-01T12:00:00.000Z',
      linkUrl: null,
      message: 'Your images are live',
      notificationId: 'notification-test-id',
      notificationStatus: 'unread',
      relatedType: 'image',
      requestStatus: 'confirmed',
      title: 'Images approved',
      userId: 'submitter-user-id',
      venueId: 'venue-test-id',
    });
    updateModerationImageStatusesMock.mockResolvedValue();
  });

  it('loads the image group by route id and renders group metadata', async () => {
    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    expect(getModerationStandaloneImageGroupMock).toHaveBeenCalledWith(
      'venue-test-id:submitter-user-id'
    );
    expect(
      screen.getByRole('heading', { name: /submitted images/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/pepper_admin/i)).toBeInTheDocument();
    expect(screen.getByText(/^submitter-user-id$/i)).toBeInTheDocument();
    expect(screen.getByText(/venue-test-id:submitter-user-id/i)).toBeInTheDocument();
    expect(screen.getByText(/pepper-palace/i)).toBeInTheDocument();
    expect(screen.getByText(/01 May 2026/)).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', {
        name: /open full-size image: standalone venue image/i,
      })
    ).toBeInTheDocument();
  });

  it('saves mixed standalone image decisions and sends the partial notification payload', async () => {
    const user = userEvent.setup();
    const expectedVenueLink =
      'https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id';
    const expectedMessage = [
      'Thanks for adding images for Pepper Palace. We approved some of them, but a few were not quite right for MapTheHeat this time.',
      `You can find the images here: ${expectedVenueLink}`,
    ].join(' ');
    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getAllByLabelText(/approve image/i)[0]);
    await user.click(screen.getAllByLabelText(/decline image/i)[1]);
    await user.click(
      screen.getByRole('button', {
        name: /save decisions and prepare notification/i,
      })
    );

    await waitFor(() => {
      expect(updateModerationImageStatusesMock).toHaveBeenCalledWith({
        approvedImageIds: ['image-1'],
        declinedImageIds: ['image-2'],
      });
    });
    expect(insertModerationNotificationMock).not.toHaveBeenCalled();

    expect(
      await screen.findByRole('heading', { name: /send notification/i })
    ).toBeInTheDocument();
    expect(screen.getByText('image')).toBeInTheDocument();
    expect(screen.getByText('partial')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveDisplayValue(
      'Some of your images for Pepper Palace were approved'
    );

    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(insertModerationNotificationMock).toHaveBeenCalledWith({
        userId: 'submitter-user-id',
        relatedType: 'image',
        title: 'Some of your images for Pepper Palace were approved',
        message: expectedMessage,
        linkUrl: expectedVenueLink,
        venueId: 'venue-test-id',
        requestStatus: 'confirmed',
      });
    });
    expect(
      updateModerationImageStatusesMock.mock.invocationCallOrder[0]
    ).toBeLessThan(insertModerationNotificationMock.mock.invocationCallOrder[0]);
  });

  it('requires every pending image to have a decision before proceeding', async () => {
    const user = userEvent.setup();
    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    const proceedButton = screen.getByRole('button', {
      name: /save decisions and prepare notification/i,
    });

    expect(proceedButton).toBeDisabled();

    await user.click(screen.getAllByLabelText(/approve image/i)[0]);

    expect(
      screen.getByText(/resolve every pending image before proceeding/i)
    ).toBeInTheDocument();
    expect(proceedButton).toBeDisabled();
    expect(updateModerationImageStatusesMock).not.toHaveBeenCalled();
  });

  it('saves every image in the standalone group as approved and sends the all-approved notification payload', async () => {
    const user = userEvent.setup();
    const expectedVenueLink =
      'https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id';
    const expectedMessage = [
      'Yay, your images for Pepper Palace have been approved.',
      `You can find the images here: ${expectedVenueLink}`,
    ].join(' ');
    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /mark all approved/i })
    );
    await user.click(
      screen.getByRole('button', {
        name: /save decisions and prepare notification/i,
      })
    );

    await waitFor(() => {
      expect(updateModerationImageStatusesMock).toHaveBeenCalledWith({
        approvedImageIds: ['image-1', 'image-2'],
        declinedImageIds: [],
      });
    });
    expect(screen.getByLabelText(/title/i)).toHaveDisplayValue(
      'Your images for Pepper Palace were approved'
    );

    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(insertModerationNotificationMock).toHaveBeenCalledWith({
        userId: 'submitter-user-id',
        relatedType: 'image',
        title: 'Your images for Pepper Palace were approved',
        message: expectedMessage,
        linkUrl: expectedVenueLink,
        venueId: 'venue-test-id',
        requestStatus: 'confirmed',
      });
    });
  });

  it('saves every image in the standalone group as declined and sends the declined notification payload', async () => {
    const user = userEvent.setup();
    const expectedVenueLink =
      'https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id';
    const expectedMessage = [
      'Thanks for adding images for Pepper Palace. We could not approve those images this time, but you can upload different ones whenever you are ready.',
      `You can find the images here: ${expectedVenueLink}`,
    ].join(' ');
    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /mark all declined/i })
    );
    await user.click(
      screen.getByRole('button', {
        name: /save decisions and prepare notification/i,
      })
    );

    await waitFor(() => {
      expect(updateModerationImageStatusesMock).toHaveBeenCalledWith({
        approvedImageIds: [],
        declinedImageIds: ['image-1', 'image-2'],
      });
    });
    expect(screen.getByLabelText(/title/i)).toHaveDisplayValue(
      'Update on your images for Pepper Palace'
    );

    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(insertModerationNotificationMock).toHaveBeenCalledWith({
        userId: 'submitter-user-id',
        relatedType: 'image',
        title: 'Update on your images for Pepper Palace',
        message: expectedMessage,
        linkUrl: expectedVenueLink,
        venueId: 'venue-test-id',
        requestStatus: 'declined',
      });
    });
  });

  it('keeps the inline composer mounted with retry when notification sending fails', async () => {
    const user = userEvent.setup();
    insertModerationNotificationMock
      .mockRejectedValueOnce(new Error('RPC failed'))
      .mockResolvedValueOnce({
        createdAt: '2026-01-01T12:00:00.000Z',
        linkUrl: null,
        message: 'Your images are live',
        notificationId: 'notification-test-id',
        notificationStatus: 'unread',
        relatedType: 'image',
        requestStatus: 'confirmed',
        title: 'Images approved',
        userId: 'submitter-user-id',
        venueId: 'venue-test-id',
      });

    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /mark all approved/i })
    );
    await user.click(
      screen.getByRole('button', {
        name: /save decisions and prepare notification/i,
      })
    );
    await user.click(
      await screen.findByRole('button', { name: /send notification/i })
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('RPC failed');
    expect(
      screen.getByRole('heading', { name: /send notification/i })
    ).toBeInTheDocument();
    expect(updateModerationImageStatusesMock).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(insertModerationNotificationMock).toHaveBeenCalledTimes(2);
    });
    expect(updateModerationImageStatusesMock).toHaveBeenCalledTimes(1);
  });

  it('renders an error state when the image group cannot be loaded', async () => {
    getModerationStandaloneImageGroupMock.mockRejectedValue(
      new Error('Not allowed')
    );

    renderGroup();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /image group could not be loaded/i
    );
    expect(
      screen.getByRole('link', { name: /back to image queue/i })
    ).toHaveAttribute('href', '/admin/moderation/images');
  });

  it('renders a not found state when no group id is present', async () => {
    renderGroup('/admin/moderation/images');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /image group not found/i
      );
    });
  });
});
