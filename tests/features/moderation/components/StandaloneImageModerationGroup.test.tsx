import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StandaloneImageModerationGroup from '@/features/moderation/components/StandaloneImageModerationGroup';
import { ModerationStandaloneImageGroup } from '@/types/venueTypes';
import AllProviders from 'tests/AllProviders';
import {
  getModerationStandaloneImageGroupMock,
  updateModerationImageStatusesMock,
} from 'tests/mocks/apiModeration';

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

  it('prepares selected standalone image status decisions before notification', async () => {
    const user = userEvent.setup();
    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(screen.getAllByLabelText(/approve image/i)[0]);
    await user.click(screen.getAllByLabelText(/decline image/i)[1]);
    await user.click(screen.getByRole('button', { name: /proceed with decisions/i }));

    expect(screen.getByRole('status')).toHaveTextContent(
      /decisions are ready/i
    );
    expect(updateModerationImageStatusesMock).not.toHaveBeenCalled();
  });

  it('requires every pending image to have a decision before proceeding', async () => {
    const user = userEvent.setup();
    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    const proceedButton = screen.getByRole('button', {
      name: /proceed with decisions/i,
    });

    expect(proceedButton).toBeDisabled();

    await user.click(screen.getAllByLabelText(/approve image/i)[0]);

    expect(
      screen.getByText(/resolve every pending image before proceeding/i)
    ).toBeInTheDocument();
    expect(proceedButton).toBeDisabled();
    expect(updateModerationImageStatusesMock).not.toHaveBeenCalled();
  });

  it('marks every image in the standalone group as approved without saving', async () => {
    const user = userEvent.setup();
    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /mark all approved/i })
    );
    await user.click(screen.getByRole('button', { name: /proceed with decisions/i }));

    expect(screen.getByRole('status')).toHaveTextContent(
      /decisions are ready/i
    );
    expect(updateModerationImageStatusesMock).not.toHaveBeenCalled();
  });

  it('marks every image in the standalone group as declined without saving', async () => {
    const user = userEvent.setup();
    renderGroup();

    expect(
      await screen.findByRole('heading', { name: /pepper palace/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /mark all declined/i })
    );
    await user.click(screen.getByRole('button', { name: /proceed with decisions/i }));

    expect(screen.getByRole('status')).toHaveTextContent(
      /decisions are ready/i
    );
    expect(updateModerationImageStatusesMock).not.toHaveBeenCalled();
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
