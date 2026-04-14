import { Button } from '@heroui/react';
import type { ButtonProps } from '@heroui/react';
import clsx from 'clsx';

type ActionIntent = 'confirm' | 'cancel';

interface ActionButtonProps extends ButtonProps {
  intent: ActionIntent;
}

const intentClasses: Record<ActionIntent, string> = {
  confirm: 'bg-success-400 text-success-foreground',
  cancel: 'bg-danger-300 text-danger-foreground',
};

function ActionButton({
  intent,
  className,
  radius = 'full',
  ...props
}: ActionButtonProps) {
  return (
    <Button
      className={clsx(
        'h-10 min-w-24 font-medium',
        intentClasses[intent],
        className
      )}
      radius={radius}
      {...props}
    />
  );
}

export default ActionButton;
