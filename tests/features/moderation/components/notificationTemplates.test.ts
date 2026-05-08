import { describe, expect, it } from 'vitest';
import {
  buildModerationNotificationTemplate,
  ModerationNotificationDecision,
} from '@/features/moderation/components/notificationTemplates';
import { NotificationRelatedType } from '@/types/userTypes';

const relatedTypes: NotificationRelatedType[] = ['venue', 'review', 'image'];
const decisions: ModerationNotificationDecision[] = [
  'approved',
  'declined',
  'partial',
];

describe('buildModerationNotificationTemplate', () => {
  it.each(relatedTypes.flatMap((relatedType) =>
    decisions.map((decision) => ({ decision, relatedType }))
  ))('builds a $decision $relatedType template', ({ decision, relatedType }) => {
    const template = buildModerationNotificationTemplate({
      decision,
      relatedType,
      venueName: 'Pepper Palace',
    });

    expect(template.title).toContain(
      relatedType === 'venue' ? 'Pepper Palace' : ''
    );
    expect(template.message).toContain('Pepper Palace');
    expect(template.message).not.toContain('here:');
  });

  it('includes a link only when requested and available', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'approved',
      includeLink: true,
      linkUrl: 'https://example.com/app/venue/london/uk/pepper-palace/1',
      relatedType: 'venue',
      venueName: 'Pepper Palace',
    });

    expect(template.message).toContain(
      'https://example.com/app/venue/london/uk/pepper-palace/1'
    );
  });

  it('omits empty link fragments when the link checkbox is off', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'approved',
      includeLink: false,
      linkUrl: 'https://example.com/app/venue/london/uk/pepper-palace/1',
      relatedType: 'venue',
      venueName: 'Pepper Palace',
    });

    expect(template.message).not.toContain('here:');
    expect(template.message).not.toContain('https://example.com');
  });

  it('adds edit and declined image context when selected', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'partial',
      mentionEdits: true,
      mentionImagesDeclined: true,
      relatedType: 'review',
      venueName: 'Pepper Palace',
    });

    expect(template.title).toBe(
      'Your review for Pepper Palace is live with a few edits'
    );
    expect(template.message).toContain('small edits');
    expect(template.message).toContain('removed or declined');
  });

  it('adds public availability context when selected', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'approved',
      mentionPublic: true,
      relatedType: 'image',
      venueName: 'Pepper Palace',
    });

    expect(template.message).toContain(
      'The item can now be found publicly on MapTheHeat.'
    );
  });
});
