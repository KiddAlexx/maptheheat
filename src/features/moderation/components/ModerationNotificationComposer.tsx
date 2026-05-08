import { FormEvent, Key, ReactNode, useState } from 'react';
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import ActionButton from '@/ui/ActionButton';
import { useInsertModerationNotification } from '../hooks/useInsertModerationNotification';
import {
  buildModerationNotificationTemplate,
  ModerationNotificationDecision,
} from './notificationTemplates';
import {
  AdminNotificationPayload,
  NotificationRelatedType,
} from '@/types/userTypes';

export interface ModerationNotificationComposerProps {
  decision?: ModerationNotificationDecision;
  includeLink?: boolean;
  linkUrl?: string | null;
  mentionEdits?: boolean;
  mentionImagesDeclined?: boolean;
  mentionPublic?: boolean;
  mode: 'manual' | 'moderation';
  recipientUserId?: string;
  recipientUsername?: string | null;
  relatedType?: NotificationRelatedType;
  venueId?: string | null;
  venueName?: string;
}

interface TemplateOptionsState {
  includeLink: boolean;
  mentionEdits: boolean;
  mentionImagesDeclined: boolean;
  mentionPublic: boolean;
}

const RELATED_TYPE_OPTIONS: Array<{
  label: string;
  value: NotificationRelatedType;
}> = [
  { label: 'Venue', value: 'venue' },
  { label: 'Review', value: 'review' },
  { label: 'Image', value: 'image' },
];

const DECISION_OPTIONS: Array<{
  label: string;
  value: ModerationNotificationDecision;
}> = [
  { label: 'Approved', value: 'approved' },
  { label: 'Declined', value: 'declined' },
  { label: 'Partial', value: 'partial' },
];

function ModerationNotificationComposer({
  decision: initialDecision = 'approved',
  includeLink = false,
  linkUrl: initialLinkUrl = '',
  mentionEdits = false,
  mentionImagesDeclined = false,
  mentionPublic = false,
  mode,
  recipientUserId = '',
  recipientUsername = null,
  relatedType: initialRelatedType = 'venue',
  venueId: initialVenueId = '',
  venueName: initialVenueName = '',
}: ModerationNotificationComposerProps) {
  const [userId, setUserId] = useState(recipientUserId);
  const [relatedType, setRelatedType] =
    useState<NotificationRelatedType>(initialRelatedType);
  const [decision, setDecision] =
    useState<ModerationNotificationDecision>(initialDecision);
  const [venueId, setVenueId] = useState(initialVenueId ?? '');
  const [venueName, setVenueName] = useState(initialVenueName);
  const [linkUrl, setLinkUrl] = useState(initialLinkUrl ?? '');
  const [templateOptions, setTemplateOptions] = useState<TemplateOptionsState>({
    includeLink,
    mentionEdits,
    mentionImagesDeclined,
    mentionPublic,
  });
  const initialTemplate = buildTemplate({
    decision: initialDecision,
    linkUrl: initialLinkUrl ?? '',
    relatedType: initialRelatedType,
    templateOptions: {
      includeLink,
      mentionEdits,
      mentionImagesDeclined,
      mentionPublic,
    },
    venueName: initialVenueName,
  });
  const [title, setTitle] = useState(initialTemplate.title);
  const [message, setMessage] = useState(initialTemplate.message);
  const [formError, setFormError] = useState<string | null>(null);
  const { insertNotification, isInserting } = useInsertModerationNotification();

  const isManual = mode === 'manual';

  function handleGenerateMessage() {
    const nextTemplate = buildTemplate({
      decision,
      linkUrl,
      relatedType,
      templateOptions,
      venueName,
    });

    setTitle(nextTemplate.title);
    setMessage(nextTemplate.message);
  }

  function handleResetTemplate() {
    const resetOptions = {
      includeLink,
      mentionEdits,
      mentionImagesDeclined,
      mentionPublic,
    };
    const nextTemplate = buildTemplate({
      decision,
      linkUrl,
      relatedType,
      templateOptions: resetOptions,
      venueName,
    });

    setTemplateOptions(resetOptions);
    setTitle(nextTemplate.title);
    setMessage(nextTemplate.message);
  }

  function handleCheckboxChange(
    key: keyof TemplateOptionsState,
    isSelected: boolean
  ) {
    setTemplateOptions((currentOptions) => ({
      ...currentOptions,
      [key]: isSelected,
    }));
  }

  function handleRelatedTypeChange(keys: 'all' | Set<Key>) {
    if (keys === 'all') return;

    const nextValue = [...keys][0];
    if (typeof nextValue === 'string') {
      setRelatedType(nextValue as NotificationRelatedType);
    }
  }

  function handleDecisionChange(keys: 'all' | Set<Key>) {
    if (keys === 'all') return;

    const nextValue = [...keys][0];
    if (typeof nextValue === 'string') {
      setDecision(nextValue as ModerationNotificationDecision);
    }
  }

  function handleSendNotification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = getPayload({
      decision,
      linkUrl,
      message,
      relatedType,
      title,
      userId,
      venueId,
    });

    if (!payload) {
      setFormError('Recipient, title, and message are required.');
      return;
    }

    insertNotification(payload, {
      onError: (err) => {
        setFormError(err.message);
      },
      onSuccess: () => {
        setFormError(null);
      },
    });
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">
        Send notification
      </h3>

      <form className="mt-4 space-y-5" onSubmit={handleSendNotification}>
        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-danger-700"
          >
            {formError}
          </p>
        ) : null}

        {isManual ? (
          <ManualFields
            decision={decision}
            linkUrl={linkUrl}
            onDecisionChange={handleDecisionChange}
            onLinkUrlChange={setLinkUrl}
            onRelatedTypeChange={handleRelatedTypeChange}
            onUserIdChange={setUserId}
            onVenueIdChange={setVenueId}
            onVenueNameChange={setVenueName}
            relatedType={relatedType}
            userId={userId}
            venueId={venueId}
            venueName={venueName}
          />
        ) : (
          <ModerationSummary
            decision={decision}
            linkUrl={linkUrl}
            recipientUsername={recipientUsername}
            relatedType={relatedType}
            userId={userId}
            venueId={venueId}
            venueName={venueName}
          />
        )}

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-900">
            Template options
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            <Checkbox
              isSelected={templateOptions.includeLink}
              onValueChange={(isSelected) =>
                handleCheckboxChange('includeLink', isSelected)
              }
            >
              Include venue link
            </Checkbox>
            <Checkbox
              isSelected={templateOptions.mentionEdits}
              onValueChange={(isSelected) =>
                handleCheckboxChange('mentionEdits', isSelected)
              }
            >
              Mention edits/changes
            </Checkbox>
            <Checkbox
              isSelected={templateOptions.mentionImagesDeclined}
              onValueChange={(isSelected) =>
                handleCheckboxChange('mentionImagesDeclined', isSelected)
              }
            >
              Mention some images were declined
            </Checkbox>
            <Checkbox
              isSelected={templateOptions.mentionPublic}
              onValueChange={(isSelected) =>
                handleCheckboxChange('mentionPublic', isSelected)
              }
            >
              Mention the item can now be found publicly
            </Checkbox>
          </div>
        </fieldset>

        <Input
          isRequired
          label="Title"
          labelPlacement="outside"
          onValueChange={setTitle}
          radius="full"
          type="text"
          value={title}
        />

        <Textarea
          isRequired
          label="Message"
          labelPlacement="outside"
          minRows={5}
          onValueChange={setMessage}
          radius="lg"
          value={message}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            radius="full"
            type="button"
            variant="flat"
            onPress={handleGenerateMessage}
          >
            Generate message
          </Button>
          <Button
            radius="full"
            type="button"
            variant="flat"
            onPress={handleResetTemplate}
          >
            Reset template
          </Button>
          <ActionButton
            intent="confirm"
            isDisabled={isInserting}
            isLoading={isInserting}
            type="submit"
          >
            Send notification
          </ActionButton>
        </div>
      </form>
    </section>
  );
}

interface ManualFieldsProps {
  decision: ModerationNotificationDecision;
  linkUrl: string;
  onDecisionChange: (keys: 'all' | Set<Key>) => void;
  onLinkUrlChange: (value: string) => void;
  onRelatedTypeChange: (keys: 'all' | Set<Key>) => void;
  onUserIdChange: (value: string) => void;
  onVenueIdChange: (value: string) => void;
  onVenueNameChange: (value: string) => void;
  relatedType: NotificationRelatedType;
  userId: string;
  venueId: string;
  venueName: string;
}

function ManualFields({
  decision,
  linkUrl,
  onDecisionChange,
  onLinkUrlChange,
  onRelatedTypeChange,
  onUserIdChange,
  onVenueIdChange,
  onVenueNameChange,
  relatedType,
  userId,
  venueId,
  venueName,
}: ManualFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input
        isRequired
        label="Recipient user id"
        labelPlacement="outside"
        onValueChange={onUserIdChange}
        radius="full"
        type="text"
        value={userId}
      />
      <Select
        label="Related type"
        labelPlacement="outside"
        onSelectionChange={onRelatedTypeChange}
        radius="full"
        selectedKeys={new Set([relatedType])}
      >
        {RELATED_TYPE_OPTIONS.map((option) => (
          <SelectItem key={option.value}>{option.label}</SelectItem>
        ))}
      </Select>
      <Select
        label="Decision"
        labelPlacement="outside"
        onSelectionChange={onDecisionChange}
        radius="full"
        selectedKeys={new Set([decision])}
      >
        {DECISION_OPTIONS.map((option) => (
          <SelectItem key={option.value}>{option.label}</SelectItem>
        ))}
      </Select>
      <Input
        label="Venue id"
        labelPlacement="outside"
        onValueChange={onVenueIdChange}
        radius="full"
        type="text"
        value={venueId}
      />
      <Input
        label="Venue name"
        labelPlacement="outside"
        onValueChange={onVenueNameChange}
        radius="full"
        type="text"
        value={venueName}
      />
      <Input
        label="Link URL"
        labelPlacement="outside"
        onValueChange={onLinkUrlChange}
        radius="full"
        type="url"
        value={linkUrl}
      />
    </div>
  );
}

interface ModerationSummaryProps {
  decision: ModerationNotificationDecision;
  linkUrl: string;
  recipientUsername: string | null;
  relatedType: NotificationRelatedType;
  userId: string;
  venueId: string;
  venueName: string;
}

function ModerationSummary({
  decision,
  linkUrl,
  recipientUsername,
  relatedType,
  userId,
  venueId,
  venueName,
}: ModerationSummaryProps) {
  return (
    <dl className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
      <SummaryItem label="Recipient">
        {recipientUsername ? `${recipientUsername} (${userId})` : userId}
      </SummaryItem>
      <SummaryItem label="Related type">{relatedType}</SummaryItem>
      <SummaryItem label="Decision">{decision}</SummaryItem>
      <SummaryItem label="Venue id">{venueId || 'Not provided'}</SummaryItem>
      <SummaryItem label="Venue name">
        {venueName || 'Not provided'}
      </SummaryItem>
      <SummaryItem label="Link URL">{linkUrl || 'Not provided'}</SummaryItem>
    </dl>
  );
}

function SummaryItem({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-normal text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-gray-800">{children}</dd>
    </div>
  );
}

function buildTemplate({
  decision,
  linkUrl,
  relatedType,
  templateOptions,
  venueName,
}: {
  decision: ModerationNotificationDecision;
  linkUrl: string;
  relatedType: NotificationRelatedType;
  templateOptions: TemplateOptionsState;
  venueName: string;
}) {
  return buildModerationNotificationTemplate({
    decision,
    linkUrl,
    relatedType,
    venueName,
    ...templateOptions,
  });
}

function getPayload({
  decision,
  linkUrl,
  message,
  relatedType,
  title,
  userId,
  venueId,
}: {
  decision: ModerationNotificationDecision;
  linkUrl: string;
  message: string;
  relatedType: NotificationRelatedType;
  title: string;
  userId: string;
  venueId: string;
}): AdminNotificationPayload | null {
  const trimmedUserId = userId.trim();
  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();

  if (!trimmedUserId || !trimmedTitle || !trimmedMessage) return null;

  return {
    userId: trimmedUserId,
    relatedType,
    title: trimmedTitle,
    message: trimmedMessage,
    linkUrl: linkUrl.trim() || null,
    venueId: venueId.trim() || null,
    requestStatus: decision === 'declined' ? 'declined' : 'confirmed',
  };
}

export default ModerationNotificationComposer;
