import { Button } from '@heroui/react';
import { useModalContext } from '../context/ModalContext';

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
            <Button
              className="bg-danger-300"
              id="firstElementToFocus"
              type="button"
              onPress={closeModal}
              aria-label="cancel dialog action"
            >
              Cancel
            </Button>
          )}

          <Button
            aria-label="confirm dialog action"
            className="bg-success-400"
            type="submit"
          >
            OK
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ConfirmationDialog;
