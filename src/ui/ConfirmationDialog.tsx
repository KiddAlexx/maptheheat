import { useModalContext } from '../context/ModalContext';
import ActionButton from '@/ui/ActionButton';

function ConfirmationDialog() {
  const { closeModal, message, confirmAction } = useModalContext();
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    confirmAction ? confirmAction() : closeModal();
  }
  return (
    <div className="px-3 pt-4">
      <p role="alert" className="mb-4">
        {message}
      </p>
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="flex w-full justify-end gap-2">
          {confirmAction && (
            <ActionButton
              intent="cancel"
              id="firstElementToFocus"
              type="button"
              onPress={closeModal}
              aria-label="cancel dialog action"
            >
              Cancel
            </ActionButton>
          )}

          <ActionButton
            intent="confirm"
            aria-label="confirm dialog action"
            type="submit"
          >
            OK
          </ActionButton>
        </div>
      </form>
    </div>
  );
}

export default ConfirmationDialog;
