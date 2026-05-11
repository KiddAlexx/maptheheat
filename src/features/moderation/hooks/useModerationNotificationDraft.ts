import { useState } from 'react';
import type { ModerationNotificationDecision } from '../components/notificationTemplates';

export interface ModerationNotificationDraftSnapshot {
  decision: ModerationNotificationDecision;
  includeLink: boolean;
  linkUrl: string | null;
  mentionEdits: boolean;
  recipientUserId: string;
  recipientUsername?: string | null;
  venueId: string;
  venueName: string;
}

export function useModerationNotificationDraft() {
  const [hasEdited, setHasEdited] = useState(false);
  const [notificationDraft, setNotificationDraft] =
    useState<ModerationNotificationDraftSnapshot | null>(null);

  function markEdited() {
    setHasEdited(true);
  }

  return { hasEdited, markEdited, notificationDraft, setNotificationDraft };
}
