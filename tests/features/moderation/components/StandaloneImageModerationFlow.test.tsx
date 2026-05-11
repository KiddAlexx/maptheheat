import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminLayout from '@/features/moderation/components/AdminLayout';
import StandaloneImageModerationGroup from '@/features/moderation/components/StandaloneImageModerationGroup';
import StandaloneImageModerationQueue from '@/features/moderation/components/StandaloneImageModerationQueue';
import { ModerationStandaloneImageGroup } from '@/types/venueTypes';
import AllProviders from 'tests/AllProviders';
import {
  getModerationStandaloneImageGroupMock,
  getModerationStandaloneImagesMock,
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

function renderStandaloneImageModeration(
  initialPath = '/admin/moderation/images'
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            path="moderation/images"
            element={<StandaloneImageModerationQueue />}
          />
          <Route
            path="moderation/images/:groupId"
            element={<StandaloneImageModerationGroup />}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('StandaloneImageModerationFlow', () => {
  beforeEach(() => {
    const imageGroup = createStandaloneImageGroup();

    vi.clearAllMocks();
    getModerationStandaloneImagesMock.mockResolvedValue({
      data: [imageGroup],
      count: 1,
    });
    getModerationStandaloneImageGroupMock.mockResolvedValue(imageGroup);
    updateModerationImageStatusesMock.mockResolvedValue();
  });

  it('opens a standalone image group detail screen from the image queue', async () => {
    const user = userEvent.setup();

    const { findByRole, getByRole } = renderStandaloneImageModeration();

    await user.click(
      await findByRole('link', { name: /pepper palace/i })
    );

    await waitFor(() => {
      expect(
        getByRole('heading', { name: /submitted images/i })
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(getModerationStandaloneImageGroupMock).toHaveBeenCalledWith(
        'venue-test-id:submitter-user-id'
      );
    });
    expect(
      getByRole('link', { name: /back to image queue/i })
    ).toHaveAttribute('href', '/admin/moderation/images');
  });
});
