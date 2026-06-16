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
  pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'border-success-200 bg-success-50 text-success-700 dark:border-success-700 dark:bg-success-900/30 dark:text-success-400',
  declined: 'border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
};
