import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ModerationNotificationComposer from '@/features/moderation/components/ModerationNotificationComposer';
import AllProviders from 'tests/AllProviders';
import { insertModerationNotificationMock } from 'tests/mocks/apiModeration';

describe('ModerationNotificationComposer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertModerationNotificationMock.mockResolvedValue({
      createdAt: '2026-01-01T12:00:00.000Z',
      linkUrl: null,
      message: 'Your venue is live',
      notificationId: 'notification-test-id',
      notificationStatus: 'unread',
      relatedType: 'venue',
      requestStatus: 'confirmed',
      title: 'Venue approved',
      userId: 'user-test-id',
      venueId: 'venue-test-id',
    });
  });

  it('keeps admin title edits until Apply template changes is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ModerationNotificationComposer
        mode="manual"
        recipientUserId="user-test-id"
        venueName="Pepper Palace"
      />,
      { wrapper: AllProviders }
    );

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Custom admin title');
    await user.click(
      screen.getByRole('checkbox', {
        name: /mention some images were declined/i,
      })
    );

    expect(titleInput).toHaveDisplayValue('Custom admin title');

    await user.click(screen.getByRole('button', { name: /apply template changes/i }));

    expect(titleInput).toHaveDisplayValue(
      'Pepper Palace is live with a few photo changes'
    );
  });

  it('sends the current editable fields as the notification payload', async () => {
    const user = userEvent.setup();

    render(
      <ModerationNotificationComposer
        includeLink
        linkUrl="https://example.com/app/venue/london/uk/pepper-palace/1"
        mode="manual"
        recipientUserId="user-test-id"
        relatedType="venue"
        venueId="venue-test-id"
        venueName="Pepper Palace"
      />,
      { wrapper: AllProviders }
    );

    const titleInput = screen.getByLabelText(/title/i);
    const messageInput = screen.getByLabelText(/message/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'A title from the admin');
    await user.clear(messageInput);
    await user.type(messageInput, 'A message from the admin');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(insertModerationNotificationMock).toHaveBeenCalledWith({
        userId: 'user-test-id',
        relatedType: 'venue',
        title: 'A title from the admin',
        message: 'A message from the admin',
        linkUrl: 'https://example.com/app/venue/london/uk/pepper-palace/1',
        venueId: 'venue-test-id',
        requestStatus: 'confirmed',
      });
    });
  });

  it('shows the moderation summary link as a clickable venue link', () => {
    render(
      <ModerationNotificationComposer
        includeLink
        linkUrl="https://maptheheat.com/app/venue/london/uk/pepper-palace/1"
        mode="moderation"
        recipientUserId="user-test-id"
        relatedType="venue"
        venueId="venue-test-id"
        venueName="Pepper Palace"
      />,
      { wrapper: AllProviders }
    );

    expect(
      screen.getByRole('link', {
        name: 'https://maptheheat.com/app/venue/london/uk/pepper-palace/1',
      })
    ).toHaveAttribute(
      'href',
      'https://maptheheat.com/app/venue/london/uk/pepper-palace/1'
    );
  });

  it('does not overwrite admin-edited copy when a reason checkbox changes', async () => {
    const user = userEvent.setup();

    render(
      <ModerationNotificationComposer
        mode="manual"
        recipientUserId="user-test-id"
        relatedType="venue"
        venueName="Pepper Palace"
      />,
      { wrapper: AllProviders }
    );

    const titleInput = screen.getByLabelText(/title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Keep this admin title');

    await user.click(
      screen.getByRole('checkbox', {
        name: /not a spicy venue/i,
      })
    );

    expect(titleInput).toHaveDisplayValue('Keep this admin title');
  });

  it('applies reason snippets to the generated message after Apply template changes', async () => {
    const user = userEvent.setup();

    render(
      <ModerationNotificationComposer
        mode="moderation"
        recipientUserId="user-test-id"
        relatedType="venue"
        decision="declined"
        venueName="Pepper Palace"
      />,
      { wrapper: AllProviders }
    );

    await user.click(
      screen.getByRole('checkbox', { name: /not a spicy venue/i })
    );
    await user.click(
      screen.getByRole('button', { name: /apply template changes/i })
    );

    expect(screen.getByLabelText(/message/i)).toHaveDisplayValue(
      /clear spicy food angle/
    );
  });

  it('resets selected reasons and regenerates clean template on Reset template', async () => {
    const user = userEvent.setup();

    render(
      <ModerationNotificationComposer
        mode="manual"
        recipientUserId="user-test-id"
        relatedType="venue"
        venueName="Pepper Palace"
      />,
      { wrapper: AllProviders }
    );

    const reasonCheckbox = screen.getByRole('checkbox', {
      name: /not a spicy venue/i,
    });
    await user.click(reasonCheckbox);
    await user.click(
      screen.getByRole('button', { name: /apply template changes/i })
    );

    expect(screen.getByLabelText(/message/i)).toHaveDisplayValue(
      /clear spicy food angle/
    );

    await user.click(
      screen.getByRole('button', { name: /reset template/i })
    );

    expect(screen.getByLabelText(/message/i)).not.toHaveDisplayValue(
      /clear spicy food angle/
    );
    expect(reasonCheckbox).not.toBeChecked();
  });

  it('disables send while the notification is in flight', async () => {
    const user = userEvent.setup();
    insertModerationNotificationMock.mockReturnValue(new Promise(() => {}));

    render(
      <ModerationNotificationComposer
        mode="manual"
        recipientUserId="user-test-id"
        venueName="Pepper Palace"
      />,
      { wrapper: AllProviders }
    );

    const sendButton = screen.getByRole('button', {
      name: /send notification/i,
    });
    await user.click(sendButton);

    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });
  });
});
