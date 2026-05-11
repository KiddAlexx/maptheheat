import clsx from 'clsx';
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from '../constants';
import { ModerationStatus } from '@/types/venueTypes';

interface ModerationStatusBadgeProps {
  status: ModerationStatus;
}

function ModerationStatusBadge({ status }: ModerationStatusBadgeProps) {
  return (
    <span
      className={clsx(
        'rounded-full border px-2.5 py-1 text-xs font-semibold',
        STATUS_BADGE_CLASSES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default ModerationStatusBadge;
