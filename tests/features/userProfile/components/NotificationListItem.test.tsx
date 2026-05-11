import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NotificationListItem from '@/features/userProfile/components/NotificationListItem';
import type { UserNotification } from '@/types/userTypes';
import AllProviders from 'tests/AllProviders';

const notification: UserNotification = {
  createdAt: '2026-05-01T10:00:00.000Z',
  linkUrl:
    'https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id',
  message:
    'Your venue is live. You can check it out here: https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id',
  notificationId: 'notification-test-id',
  notificationStatus: 'unread',
  relatedType: 'venue',
  requestStatus: 'confirmed',
  title: 'Venue approved',
  userId: 'user-test-id',
  venueId: 'venue-test-id',
};

describe('NotificationListItem', () => {
  it('renders the notification message URL as a clickable link', () => {
    render(<NotificationListItem notification={notification} />, {
      wrapper: AllProviders,
    });

    expect(
      screen.getByRole('link', {
        name: 'https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id',
      })
    ).toHaveAttribute(
      'href',
      'https://maptheheat.com/app/venue/London/United Kingdom/pepper-palace/venue-test-id'
    );
    expect(
      screen.queryByRole('link', { name: /view venue/i })
    ).not.toBeInTheDocument();
  });
});
