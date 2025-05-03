import { Button } from '@heroui/react';
import { useModalContext } from '../context/ModalContext';

function ConfirmationDialog() {
  const { closeModal, message, confirmAction } = useModalContext();
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    confirmAction ? confirmAction() : closeModal();
  }
  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <p>{message}</p>

      {confirmAction && (
        <Button type="button" onPress={closeModal}>
          Cancel
        </Button>
      )}

      <Button type="submit">OK</Button>
    </form>
  );
}

export default ConfirmationDialog;
