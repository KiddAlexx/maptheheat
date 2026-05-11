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

  it('does not add a separate public availability sentence', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'approved',
      includeLink: true,
      linkUrl: 'https://example.com/app/venue/london/uk/pepper-palace/1',
      relatedType: 'image',
      venueName: 'Pepper Palace',
    });

    expect(template.message).not.toContain('can now be found publicly');
    expect(template.message).toContain('You can find the images here:');
  });

  it('includes the venue link in declined image notifications when requested', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'declined',
      includeLink: true,
      linkUrl: 'https://example.com/app/venue/london/uk/pepper-palace/1',
      relatedType: 'image',
      venueName: 'Pepper Palace',
    });

    expect(template.message).toContain(
      'https://example.com/app/venue/london/uk/pepper-palace/1'
    );
  });

  it('appends a venue reason snippet to the message', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'declined',
      reasonIds: ['venue-not-spicy'],
      relatedType: 'venue',
      venueName: 'Pepper Palace',
    });

    expect(template.message).toContain(
      'MapTheHeat is focused on places with a clear spicy food angle'
    );
  });

  it('appends a review reason snippet to the message', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'declined',
      reasonIds: ['review-wrong-venue'],
      relatedType: 'review',
      venueName: 'Pepper Palace',
    });

    expect(template.message).toContain(
      'does not appear to be about the selected venue'
    );
  });

  it('appends an image reason snippet to the message', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'declined',
      reasonIds: ['image-low-quality'],
      relatedType: 'image',
      venueName: 'Pepper Palace',
    });

    expect(template.message).toContain(
      'too unclear or low quality to publish'
    );
  });

  it('appends multiple reason snippets in order before the link sentence', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'approved',
      includeLink: true,
      linkUrl: 'https://example.com/app/venue/london/uk/pepper-palace/1',
      reasonIds: ['venue-not-spicy', 'venue-duplicate'],
      relatedType: 'venue',
      venueName: 'Pepper Palace',
    });

    const notSpicyIndex = template.message.indexOf('clear spicy food angle');
    const duplicateIndex = template.message.indexOf(
      'appears to be a duplicate'
    );
    const linkIndex = template.message.indexOf('You can find the venue here:');

    expect(notSpicyIndex).toBeGreaterThan(-1);
    expect(duplicateIndex).toBeGreaterThan(notSpicyIndex);
    expect(linkIndex).toBeGreaterThan(duplicateIndex);
  });

  it('ignores reason ids that do not belong to the selected related type', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'declined',
      // venue reasons passed to a review notification are not in MODERATION_REASONS['review'], so they are ignored
      reasonIds: ['venue-not-spicy'],
      relatedType: 'review',
      venueName: 'Pepper Palace',
    });

    expect(template.message).not.toContain('clear spicy food angle');
  });

  it('does not append reason snippets when no reasonIds are selected', () => {
    const template = buildModerationNotificationTemplate({
      decision: 'declined',
      reasonIds: [],
      relatedType: 'venue',
      venueName: 'Pepper Palace',
    });

    expect(template.message).not.toContain('clear spicy food angle');
    expect(template.message).not.toContain('duplicate');
  });
});
