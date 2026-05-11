import { NotificationRelatedType } from '@/types/userTypes';

export type ModerationNotificationDecision =
  | 'approved'
  | 'declined'
  | 'partial';

export type ModerationReasonId =
  | 'venue-not-spicy'
  | 'venue-duplicate'
  | 'venue-unverified'
  | 'venue-incomplete'
  | 'venue-unsuitable-photos'
  | 'review-not-detailed'
  | 'review-wrong-venue'
  | 'review-not-spicy'
  | 'review-explicit'
  | 'review-unsuitable-images'
  | 'image-low-quality'
  | 'image-wrong-venue'
  | 'image-duplicate'
  | 'image-explicit'
  | 'image-private';

export interface ModerationReason {
  id: ModerationReasonId;
  label: string;
  snippet: string;
}

export const MODERATION_REASONS: Record<
  NotificationRelatedType,
  ModerationReason[]
> = {
  venue: [
    {
      id: 'venue-not-spicy',
      label: 'Not a spicy venue / no clear spicy-food angle',
      snippet:
        'MapTheHeat is focused on places with a clear spicy food angle, and this one does not seem like the right fit for us right now.',
    },
    {
      id: 'venue-duplicate',
      label: 'Duplicate or already listed',
      snippet:
        'This venue appears to be a duplicate of one already listed on MapTheHeat.',
    },
    {
      id: 'venue-unverified',
      label: 'Could not verify details',
      snippet:
        'We were not able to verify the details for this submission.',
    },
    {
      id: 'venue-incomplete',
      label: 'Incomplete or confusing submission',
      snippet: 'The submission was incomplete or too unclear for us to process.',
    },
    {
      id: 'venue-unsuitable-photos',
      label: 'Unsuitable photos were removed',
      snippet:
        'Some photos were not suitable for the venue page, so we removed or declined those images.',
    },
  ],
  review: [
    {
      id: 'review-not-detailed',
      label: 'Not enough useful detail',
      snippet:
        'The review did not include enough useful detail for us to publish it.',
    },
    {
      id: 'review-wrong-venue',
      label: 'Not about the selected venue',
      snippet: 'The review does not appear to be about the selected venue.',
    },
    {
      id: 'review-not-spicy',
      label: 'Not focused on the spicy item / heat experience',
      snippet:
        'The review was not focused on the spicy item or heat experience.',
    },
    {
      id: 'review-explicit',
      label: 'Explicit, abusive, or unsafe content',
      snippet:
        'Some submitted content included explicit material, so we could not approve it.',
    },
    {
      id: 'review-unsuitable-images',
      label: 'Attached review images were unsuitable',
      snippet:
        'Some photos attached to the review were not suitable, so we removed or declined those images.',
    },
  ],
  image: [
    {
      id: 'image-low-quality',
      label: 'Low quality or unclear image',
      snippet: 'A few images were too unclear or low quality to publish.',
    },
    {
      id: 'image-wrong-venue',
      label: 'Not related to the venue or food',
      snippet:
        'Some images did not appear to be related to the venue or food.',
    },
    {
      id: 'image-duplicate',
      label: 'Duplicate or near-duplicate image',
      snippet:
        'Some images were duplicates or near-duplicates of existing images.',
    },
    {
      id: 'image-explicit',
      label: 'Explicit or unsafe content',
      snippet:
        'Some submitted content included explicit material, so we could not approve it.',
    },
    {
      id: 'image-private',
      label: 'Contains private or sensitive information',
      snippet:
        'Some images contained private or sensitive information and could not be published.',
    },
  ],
};

export interface ModerationNotificationTemplateOptions {
  decision: ModerationNotificationDecision;
  includeLink?: boolean;
  linkUrl?: string;
  mentionEdits?: boolean;
  mentionImagesDeclined?: boolean;
  reasonIds?: ModerationReasonId[];
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
  reasonIds = [],
  relatedType,
  venueName,
}: ModerationNotificationTemplateOptions): ModerationNotificationTemplate {
  const safeVenueName = venueName?.trim() || 'this venue';
  const canIncludeLink = includeLink && !!linkUrl?.trim();

  const reasonSnippets = MODERATION_REASONS[relatedType]
    .filter((r) => reasonIds.includes(r.id))
    .map((r) => r.snippet);

  if (relatedType === 'review') {
    return buildReviewTemplate({
      canIncludeLink,
      decision,
      linkUrl,
      mentionEdits,
      mentionImagesDeclined,
      reasonSnippets,
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
      reasonSnippets,
      venueName: safeVenueName,
    });
  }

  return buildVenueTemplate({
    canIncludeLink,
    decision,
    linkUrl,
    mentionEdits,
    mentionImagesDeclined,
    reasonSnippets,
    venueName: safeVenueName,
  });
}

interface TemplateBranchOptions {
  canIncludeLink: boolean;
  decision: ModerationNotificationDecision;
  linkUrl?: string;
  mentionEdits: boolean;
  mentionImagesDeclined: boolean;
  reasonSnippets: string[];
  venueName: string;
}

function buildVenueTemplate({
  canIncludeLink,
  decision,
  linkUrl,
  mentionEdits,
  mentionImagesDeclined,
  reasonSnippets,
  venueName,
}: TemplateBranchOptions): ModerationNotificationTemplate {
  if (decision === 'declined') {
    return {
      title: `Update on ${venueName}`,
      message: appendOptionalSentences(
        `Thanks for submitting ${venueName}. We could not approve it this time, but you can make changes and try again.`,
        { mentionImagesDeclined, reasonSnippets }
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
        reasonSnippets,
      }),
    };
  }

  return {
    title: `Yay, ${venueName} is live!`,
    message: appendOptionalSentences(
      `Good news - your venue ${venueName} has been approved.`,
      { canIncludeLink, linkLabel: 'venue', linkUrl, reasonSnippets }
    ),
  };
}

function buildReviewTemplate({
  canIncludeLink,
  decision,
  linkUrl,
  mentionEdits,
  mentionImagesDeclined,
  reasonSnippets,
  venueName,
}: TemplateBranchOptions): ModerationNotificationTemplate {
  if (decision === 'declined') {
    return {
      title: `Update on your review for ${venueName}`,
      message: appendOptionalSentences(
        `Thanks for sending your review for ${venueName}. We could not approve it this time, but you can edit it and try again.`,
        { mentionImagesDeclined, reasonSnippets }
      ),
    };
  }

  if (decision === 'partial' || mentionEdits || mentionImagesDeclined) {
    return {
      title: `Your review for ${venueName} is live with a few edits`,
      message: appendOptionalSentences(
        `Yay, your review for ${venueName} has been approved. We made a few small edits before publishing it.`,
        { canIncludeLink, linkLabel: 'review', linkUrl, mentionImagesDeclined, reasonSnippets }
      ),
    };
  }

  return {
    title: `Your review for ${venueName} is live`,
    message: appendOptionalSentences(
      `Yay, your review for ${venueName} has been approved.`,
      { canIncludeLink, linkLabel: 'review', linkUrl, reasonSnippets }
    ),
  };
}

function buildImageTemplate({
  canIncludeLink,
  decision,
  linkUrl,
  mentionImagesDeclined,
  reasonSnippets,
  venueName,
}: TemplateBranchOptions): ModerationNotificationTemplate {
  if (decision === 'declined') {
    return {
      title: `Update on your images for ${venueName}`,
      message: appendOptionalSentences(
        `Thanks for adding images for ${venueName}. We could not approve those images this time, but you can upload different ones whenever you are ready.`,
        { canIncludeLink, linkLabel: 'images', linkUrl, mentionImagesDeclined, reasonSnippets }
      ),
    };
  }

  if (decision === 'partial' || mentionImagesDeclined) {
    return {
      title: `Some of your images for ${venueName} were approved`,
      message: appendOptionalSentences(
        `Thanks for adding images for ${venueName}. We approved some of them, but a few were not quite right for MapTheHeat this time.`,
        { canIncludeLink, linkLabel: 'images', linkUrl, mentionImagesDeclined, reasonSnippets }
      ),
    };
  }

  return {
    title: `Your images for ${venueName} were approved`,
    message: appendOptionalSentences(
      `Yay, your images for ${venueName} have been approved.`,
      { canIncludeLink, linkLabel: 'images', linkUrl, reasonSnippets }
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
    reasonSnippets = [],
  }: {
    canIncludeLink?: boolean;
    linkLabel?: 'images' | 'item' | 'review' | 'venue';
    linkUrl?: string;
    mentionEdits?: boolean;
    mentionImagesDeclined?: boolean;
    reasonSnippets?: string[];
  }
): string {
  const sentences = [message];

  if (mentionEdits) {
    sentences.push('We made a few small edits before publishing it.');
  }

  if (mentionImagesDeclined) {
    sentences.push('Some photos were not suitable for the venue page, so we removed or declined those images.');
  }

  for (const snippet of reasonSnippets) {
    sentences.push(snippet);
  }

  if (canIncludeLink && linkUrl) {
    sentences.push(`You can find the ${linkLabel} here: ${linkUrl}`);
  }

  return sentences.join(' ');
}
