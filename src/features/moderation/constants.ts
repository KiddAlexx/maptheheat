import { ModerationStatus } from '@/types/venueTypes';

export const MODERATION_STATUSES: ModerationStatus[] = [
  'pending',
  'approved',
  'declined',
];

export const STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
};

export const STATUS_BADGE_CLASSES: Record<ModerationStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  approved: 'border-success-200 bg-success-50 text-success-700',
  declined: 'border-danger-200 bg-danger-50 text-danger-700',
};
