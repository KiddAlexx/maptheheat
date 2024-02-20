import { useModalContext } from '../context/ModalContext';

function ConfirmationDialog({ handleConfirm }) {
  const { closeModal } = useModalContext();
  return (
    <form onSubmit={handleConfirm}>
      <p>Are you sure you want to delete this review</p>
      <button type="button" onClick={closeModal}>
        Cancel
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}

export default ConfirmationDialog;
