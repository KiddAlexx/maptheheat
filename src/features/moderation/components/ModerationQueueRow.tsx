import { ReactNode } from 'react';
import { Button } from '@heroui/react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from '../constants';
import { ModerationStatus } from '@/types/venueTypes';

interface ModerationQueueRowProps {
  actionLabel?: string;
  detailHref: string;
  metadata: ReactNode;
  status: ModerationStatus;
  title: string;
}

function ModerationQueueRow({
  actionLabel = 'Review',
  detailHref,
  metadata,
  status,
  title,
}: ModerationQueueRowProps) {
  return (
    <li>
      <article className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-md transition hover:border-primary-200 hover:bg-primary-50/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                <Link
                  to={detailHref}
                  className="rounded-sm hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {title}
                </Link>
              </h3>
              <span
                className={clsx(
                  'rounded-full border px-2.5 py-1 text-xs font-semibold',
                  STATUS_BADGE_CLASSES[status]
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>

            {metadata}
          </div>

          <Button
            as={Link}
            to={detailHref}
            radius="full"
            color="primary"
            variant="flat"
            className="shrink-0"
          >
            {actionLabel}
          </Button>
        </div>
      </article>
    </li>
  );
}

export default ModerationQueueRow;
