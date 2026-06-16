import { useEffect, useState } from 'react';
import { Button, Input } from '@heroui/react';
import { useSearchModerationNotificationRecipients } from '../hooks/useSearchModerationNotificationRecipients';
import ModerationNotificationComposer from './ModerationNotificationComposer';
import { ModerationNotificationRecipient } from '@/types/userTypes';

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function AdminNotificationCenter() {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] =
    useState<ModerationNotificationRecipient | null>(null);
  const shouldSearch = debouncedQuery.trim().length >= 2;
  const {
    error,
    isPending: isSearching,
    recipients,
  } = useSearchModerationNotificationRecipients(debouncedQuery);

  useEffect(() => {
    const trimmedSearchValue = searchValue.trim();

    if (UUID_PATTERN.test(trimmedSearchValue)) {
      setSelectedRecipient({
        userId: trimmedSearchValue,
        username: null,
      });
      setDebouncedQuery('');
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(trimmedSearchValue);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  function handleRecipientSearchChange(value: string) {
    setSearchValue(value);
  }

  function handleRecipientSelect(recipient: ModerationNotificationRecipient) {
    setSelectedRecipient(recipient);
    setSearchValue(formatRecipientLabel(recipient));
    setDebouncedQuery('');
  }

  return (
    <section aria-labelledby="notification-center-title">
      <div className="mb-5">
        <h2 id="notification-center-title" className="text-2xl font-semibold">
          Notifications
        </h2>
        <p className="mt-1 text-sm text-app-muted">
          Send manual moderation notifications without changing content status.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(18rem,24rem)_1fr] xl:items-start">
        <RecipientPicker
          error={error}
          isSearching={shouldSearch && isSearching}
          onRecipientSearchChange={handleRecipientSearchChange}
          onRecipientSelect={handleRecipientSelect}
          recipients={shouldSearch ? recipients : []}
          searchValue={searchValue}
          selectedRecipient={selectedRecipient}
          shouldSearch={shouldSearch}
        />

        <ModerationNotificationComposer
          key={selectedRecipient?.userId ?? 'empty-recipient'}
          mode="manual"
          recipientUserId={selectedRecipient?.userId ?? ''}
          recipientUsername={selectedRecipient?.username ?? null}
        />
      </div>
    </section>
  );
}

interface RecipientPickerProps {
  error: Error | null;
  isSearching: boolean;
  onRecipientSearchChange: (value: string) => void;
  onRecipientSelect: (recipient: ModerationNotificationRecipient) => void;
  recipients: ModerationNotificationRecipient[];
  searchValue: string;
  selectedRecipient: ModerationNotificationRecipient | null;
  shouldSearch: boolean;
}

function RecipientPicker({
  error,
  isSearching,
  onRecipientSearchChange,
  onRecipientSelect,
  recipients,
  searchValue,
  selectedRecipient,
  shouldSearch,
}: RecipientPickerProps) {
  return (
    <section className="rounded-xl border border-app-border bg-app-card p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold">
        Choose recipient
      </h3>

      <div className="mt-4 space-y-4">
        <Input
          aria-autocomplete="list"
          aria-controls="recipient-results"
          label="Search by username or user id"
          labelPlacement="outside"
          onValueChange={onRecipientSearchChange}
          placeholder="Username or paste user id"
          radius="full"
          type="text"
          value={searchValue}
        />

        {selectedRecipient ? (
          <p className="rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-success-700">
            Selected {formatRecipientLabel(selectedRecipient)}
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-danger-700"
          >
            Recipient search failed.
          </p>
        ) : null}

        {isSearching ? (
          <p role="status" className="text-sm text-app-muted">
            Searching recipients...
          </p>
        ) : null}

        {shouldSearch && !isSearching && recipients.length === 0 ? (
          <p role="status" className="text-sm text-app-muted">
            No recipients found.
          </p>
        ) : null}

        {recipients.length > 0 ? (
          <ul
            id="recipient-results"
            aria-label="Notification recipient results"
            role="listbox"
            className="space-y-2"
          >
            {recipients.map((recipient) => (
              <li key={recipient.userId}>
                <Button
                  aria-label={`Select recipient ${formatRecipientLabel(recipient)}`}
                  className="h-auto w-full justify-start rounded-lg border border-app-border bg-app-card px-3 py-2 text-left text-sm"
                  onPress={() => onRecipientSelect(recipient)}
                  variant="flat"
                >
                  <span className="flex min-w-0 flex-col items-start">
                    <span className="font-medium">
                      {recipient.username ?? 'Unknown username'}
                    </span>
                    <span className="break-all text-xs text-app-muted">
                      {recipient.userId}
                    </span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function formatRecipientLabel({
  userId,
  username,
}: ModerationNotificationRecipient): string {
  return username ? `${username} (${userId})` : userId;
}

export default AdminNotificationCenter;
