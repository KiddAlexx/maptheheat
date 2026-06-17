import { ReactNode } from 'react';

interface ModerationDetailItemProps {
  children: ReactNode;
  label: string;
}

function ModerationDetailItem({ children, label }: ModerationDetailItemProps) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-normal text-app-muted">
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

export default ModerationDetailItem;
