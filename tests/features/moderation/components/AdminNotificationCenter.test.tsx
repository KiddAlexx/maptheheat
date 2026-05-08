import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminLayout from '@/features/moderation/components/AdminLayout';
import AdminNotificationCenter from '@/features/moderation/components/AdminNotificationCenter';
import AllProviders from 'tests/AllProviders';
import {
  insertModerationNotificationMock,
  searchModerationNotificationRecipientsMock,
  updateModerationImageStatusesMock,
  updateModerationReviewStatusMock,
  updateModerationVenueStatusMock,
} from 'tests/mocks/apiModeration';

const USER_ID = '11111111-1111-4111-8111-111111111111';

function renderNotificationRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin/moderation/notifications']}>
      <Routes>
        <Route path="/admin/moderation" element={<AdminLayout />}>
          <Route path="notifications" element={<AdminNotificationCenter />} />
        </Route>
      </Routes>
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

async function pasteDirectRecipient(user: ReturnType<typeof userEvent.setup>) {
  const searchInput = screen.getByLabelText(/search by username or user id/i);

  await user.click(searchInput);
  await user.paste(USER_ID);
}

describe('AdminNotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchModerationNotificationRecipientsMock.mockResolvedValue([
      {
        userId: USER_ID,
        username: 'pepperfan',
      },
    ]);
    insertModerationNotificationMock.mockResolvedValue({
      createdAt: '2026-01-01T12:00:00.000Z',
      linkUrl: null,
      message: 'Your venue is live',
      notificationId: 'notification-test-id',
      notificationStatus: 'unread',
      relatedType: 'venue',
      requestStatus: 'confirmed',
      title: 'Venue approved',
      userId: USER_ID,
      venueId: null,
    });
    updateModerationVenueStatusMock.mockResolvedValue();
    updateModerationReviewStatusMock.mockResolvedValue();
    updateModerationImageStatusesMock.mockResolvedValue();
  });

  it('renders from the notifications route', () => {
    renderNotificationRoute();

    expect(
      screen.getByRole('heading', { name: /notifications/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /choose recipient/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /send notification/i })
    ).toBeInTheDocument();
  });

  it('debounces recipient search and calls the hook query with the expected query', async () => {
    const user = userEvent.setup();
    renderNotificationRoute();

    await user.type(
      screen.getByLabelText(/search by username or user id/i),
      'pe'
    );

    await waitFor(() => {
      expect(searchModerationNotificationRecipientsMock).toHaveBeenCalledWith(
        'pe'
      );
    });
  });

  it('fills the manual user id field when a recipient result is picked', async () => {
    const user = userEvent.setup();
    renderNotificationRoute();

    await user.type(
      screen.getByLabelText(/search by username or user id/i),
      'pep'
    );
    await user.click(
      await screen.findByRole('button', {
        name: new RegExp(`pepperfan.*${USER_ID}`),
      })
    );

    expect(screen.getByLabelText(/recipient user id/i)).toHaveDisplayValue(
      USER_ID
    );
  });

  it('selects a pasted UUID recipient without running recipient search', async () => {
    const user = userEvent.setup();
    renderNotificationRoute();

    await pasteDirectRecipient(user);

    expect(screen.getByLabelText(/recipient user id/i)).toHaveDisplayValue(
      USER_ID
    );
    expect(searchModerationNotificationRecipientsMock).not.toHaveBeenCalled();
  });

  it('only updates generated copy after Generate message or Reset template is clicked', async () => {
    const user = userEvent.setup();
    renderNotificationRoute();

    const venueInput = screen.getByLabelText(/venue name/i);
    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(venueInput);
    await user.type(venueInput, 'Pepper Palace');
    await user.clear(titleInput);
    await user.type(titleInput, 'Keep this admin title');

    await user.click(
      screen.getByRole('checkbox', {
        name: /mention some images were declined/i,
      })
    );

    expect(titleInput).toHaveDisplayValue('Keep this admin title');

    await user.click(screen.getByRole('button', { name: /generate message/i }));

    expect(titleInput).toHaveDisplayValue(
      'Pepper Palace is live with a few photo changes'
    );

    await user.click(
      screen.getByRole('checkbox', {
        name: /mention some images were declined/i,
      })
    );

    expect(titleInput).toHaveDisplayValue(
      'Pepper Palace is live with a few photo changes'
    );

    await user.click(screen.getByRole('button', { name: /reset template/i }));

    expect(titleInput).toHaveDisplayValue('Yay, Pepper Palace is live!');
  });

  it('sends the manual notification payload without moderation status mutations', async () => {
    const user = userEvent.setup();
    renderNotificationRoute();
    await pasteDirectRecipient(user);

    await user.type(screen.getByLabelText(/venue id/i), 'venue-test-id');
    await user.type(screen.getByLabelText(/venue name/i), 'Pepper Palace');

    const titleInput = screen.getByLabelText(/title/i);
    const messageInput = screen.getByLabelText(/message/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Manual admin title');
    await user.clear(messageInput);
    await user.type(messageInput, 'Manual admin message');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(insertModerationNotificationMock).toHaveBeenCalledWith({
        userId: USER_ID,
        relatedType: 'venue',
        title: 'Manual admin title',
        message: 'Manual admin message',
        linkUrl: null,
        venueId: 'venue-test-id',
        requestStatus: 'confirmed',
      });
    });
    expect(updateModerationVenueStatusMock).not.toHaveBeenCalled();
    expect(updateModerationReviewStatusMock).not.toHaveBeenCalled();
    expect(updateModerationImageStatusesMock).not.toHaveBeenCalled();
  });

  it('disables the send button while the notification is in flight', async () => {
    const user = userEvent.setup();
    insertModerationNotificationMock.mockReturnValue(new Promise(() => {}));
    renderNotificationRoute();
    await pasteDirectRecipient(user);

    const sendButton = screen.getByRole('button', {
      name: /send notification/i,
    });
    await user.click(sendButton);

    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });
  });
});
