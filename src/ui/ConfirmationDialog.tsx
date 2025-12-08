import { Button } from '@heroui/react';
import { useModalContext } from '../context/ModalContext';

function ConfirmationDialog() {
  const { closeModal, message, confirmAction } = useModalContext();
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    confirmAction ? confirmAction() : closeModal();
  }
  return (
    <form className="px-3 pt-4" onSubmit={(e) => handleSubmit(e)}>
      <p className="mb-4">{message}</p>
      <div className="flex w-full justify-end gap-2">
        {confirmAction && (
          <Button className="bg-danger-300" type="button" onPress={closeModal}>
            Cancel
          </Button>
        )}

        <Button className="bg-success-400" type="submit">
          OK
        </Button>
      </div>
    </form>
  );
}

export default ConfirmationDialog;
