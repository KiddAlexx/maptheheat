import ActionButton from '@/ui/ActionButton';
import { ModerationStatus } from '@/types/venueTypes';

interface ModerationStatusActionsProps {
  hasPendingImageWithoutDecision?: boolean;
  isUpdating: boolean;
  onApprove: () => void;
  onDecline: () => void;
  resourceLabel: string;
  status: ModerationStatus;
}

function ModerationStatusActions({
  hasPendingImageWithoutDecision = false,
  isUpdating,
  onApprove,
  onDecline,
  resourceLabel,
  status,
}: ModerationStatusActionsProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">
        {capitalize(resourceLabel)} decision
      </h3>
      <p className="mt-1 text-sm text-zinc-600">
        Set the final status for this {resourceLabel} submission.
      </p>
      {hasPendingImageWithoutDecision ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Resolve all pending image decisions before approving this{' '}
          {resourceLabel}.
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <ActionButton
          intent="confirm"
          isDisabled={
            status === 'approved' || isUpdating || hasPendingImageWithoutDecision
          }
          isLoading={isUpdating}
          onPress={onApprove}
        >
          Approve {resourceLabel}
        </ActionButton>
        <ActionButton
          intent="cancel"
          isDisabled={status === 'declined' || isUpdating}
          isLoading={isUpdating}
          onPress={onDecline}
        >
          Decline {resourceLabel}
        </ActionButton>
      </div>
    </section>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default ModerationStatusActions;
