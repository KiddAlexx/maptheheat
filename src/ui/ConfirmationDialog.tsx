import { Button } from '@nextui-org/react';
import { useModalContext } from '../context/ModalContext';

function ConfirmationDialog() {
  const { closeModal, message, confirmAction } = useModalContext();
  function handleSubmit(e) {
    e.preventDefault();
    confirmAction ? confirmAction() : closeModal();
  }
  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <p>{message}</p>

      {confirmAction && (
        <Button type="button" onClick={closeModal}>
          Cancel
        </Button>
      )}

      <Button type="submit">OK</Button>
    </form>
  );
}

export default ConfirmationDialog;
