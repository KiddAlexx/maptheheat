import { NotificationRelatedType } from '@/types/userTypes';

export type ModerationNotificationDecision =
  | 'approved'
  | 'declined'
  | 'partial';

export interface ModerationNotificationTemplateOptions {
  decision: ModerationNotificationDecision;
  includeLink?: boolean;
  linkUrl?: string;
  mentionEdits?: boolean;
  mentionImagesDeclined?: boolean;
  relatedType: NotificationRelatedType;
  venueName?: string;
}

export interface ModerationNotificationTemplate {
  title: string;
  message: string;
}

export function buildModerationNotificationTemplate({
  decision,
  includeLink = false,
  linkUrl,
  mentionEdits = false,
  mentionImagesDeclined = false,
  relatedType,
  venueName,
}: ModerationNotificationTemplateOptions): ModerationNotificationTemplate {
  const safeVenueName = venueName?.trim() || 'this venue';
  const canIncludeLink = includeLink && !!linkUrl?.trim();

  if (relatedType === 'review') {
    return buildReviewTemplate({
      canIncludeLink,
      decision,
      linkUrl,
      mentionEdits,
      mentionImagesDeclined,
      venueName: safeVenueName,
    });
  }

  if (relatedType === 'image') {
    return buildImageTemplate({
      canIncludeLink,
      decision,
      linkUrl,
      mentionEdits,
      mentionImagesDeclined,
      venueName: safeVenueName,
    });
  }

  return buildVenueTemplate({
    canIncludeLink,
    decision,
    linkUrl,
    mentionEdits,
    mentionImagesDeclined,
    venueName: safeVenueName,
  });
}

interface TemplateBranchOptions {
  canIncludeLink: boolean;
  decision: ModerationNotificationDecision;
  linkUrl?: string;
  mentionEdits: boolean;
  mentionImagesDeclined: boolean;
  venueName: string;
}

function buildVenueTemplate({
  canIncludeLink,
  decision,
  linkUrl,
  mentionEdits,
  mentionImagesDeclined,
  venueName,
}: TemplateBranchOptions): ModerationNotificationTemplate {
  if (decision === 'declined') {
    return {
      title: `Update on ${venueName}`,
      message: appendOptionalSentences(
        `Thanks for submitting ${venueName}. We could not approve it this time, but you can make changes and try again.`,
        { mentionImagesDeclined }
      ),
    };
  }

  if (decision === 'partial' || mentionEdits || mentionImagesDeclined) {
    const title = mentionImagesDeclined
      ? `${venueName} is live with a few photo changes`
      : `${venueName} has been approved with a few tidy-ups`;
    const editMessage = mentionImagesDeclined
      ? `Yay, ${venueName} has been approved. We removed a few photos that were not suitable.`
      : `Yay, ${venueName} has been approved. We made a few small edits before approving it.`;

    return {
      title,
      message: appendOptionalSentences(editMessage, {
        canIncludeLink,
        linkUrl,
        linkLabel: 'venue',
      }),
    };
  }

  return {
    title: `Yay, ${venueName} is live!`,
    message: appendOptionalSentences(
      `Good news - your venue ${venueName} has been approved.`,
      { canIncludeLink, linkLabel: 'venue', linkUrl }
    ),
  };
}

function buildReviewTemplate({
  canIncludeLink,
  decision,
  linkUrl,
  mentionEdits,
  mentionImagesDeclined,
  venueName,
}: TemplateBranchOptions): ModerationNotificationTemplate {
  if (decision === 'declined') {
    return {
      title: `Update on your review for ${venueName}`,
      message: appendOptionalSentences(
        `Thanks for sending your review for ${venueName}. We could not approve it this time, but you can edit it and try again.`,
        { mentionImagesDeclined }
      ),
    };
  }

  if (decision === 'partial' || mentionEdits || mentionImagesDeclined) {
    return {
      title: `Your review for ${venueName} is live with a few edits`,
      message: appendOptionalSentences(
        `Yay, your review for ${venueName} has been approved. We made a few small edits before publishing it.`,
        { canIncludeLink, linkLabel: 'review', linkUrl, mentionImagesDeclined }
      ),
    };
  }

  return {
    title: `Your review for ${venueName} is live`,
    message: appendOptionalSentences(
      `Yay, your review for ${venueName} has been approved.`,
      { canIncludeLink, linkLabel: 'review', linkUrl }
    ),
  };
}

function buildImageTemplate({
  canIncludeLink,
  decision,
  linkUrl,
  mentionEdits,
  mentionImagesDeclined,
  venueName,
}: TemplateBranchOptions): ModerationNotificationTemplate {
  if (decision === 'declined') {
    return {
      title: `Update on your images for ${venueName}`,
      message: appendOptionalSentences(
        `Thanks for adding images for ${venueName}. We could not approve those images this time, but you can upload different ones whenever you are ready.`,
        { canIncludeLink, linkLabel: 'images', linkUrl, mentionImagesDeclined }
      ),
    };
  }

  if (decision === 'partial' || mentionImagesDeclined) {
    return {
      title: `Some of your images for ${venueName} were approved`,
      message: appendOptionalSentences(
        `Thanks for adding images for ${venueName}. We approved some of them, but a few were not quite right for MapTheHeat this time.`,
        { canIncludeLink, linkLabel: 'images', linkUrl, mentionEdits }
      ),
    };
  }

  return {
    title: `Your images for ${venueName} were approved`,
    message: appendOptionalSentences(
      `Yay, your images for ${venueName} have been approved.`,
      { canIncludeLink, linkLabel: 'images', linkUrl, mentionEdits }
    ),
  };
}

function appendOptionalSentences(
  message: string,
  {
    canIncludeLink = false,
    linkLabel = 'item',
    linkUrl,
    mentionEdits = false,
    mentionImagesDeclined = false,
  }: {
    canIncludeLink?: boolean;
    linkLabel?: 'images' | 'item' | 'review' | 'venue';
    linkUrl?: string;
    mentionEdits?: boolean;
    mentionImagesDeclined?: boolean;
  }
): string {
  const sentences = [message];

  if (mentionEdits) {
    sentences.push('We made a few small edits before publishing it.');
  }

  if (mentionImagesDeclined) {
    sentences.push('Some photos were not suitable for the venue page, so we removed or declined those images.');
  }

  if (canIncludeLink && linkUrl) {
    sentences.push(`You can find the ${linkLabel} here: ${linkUrl}`);
  }

  return sentences.join(' ');
}
