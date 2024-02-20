import { useModalContext } from '../context/ModalContext';

function ConfirmationDialog() {
  const { closeModal, message, confirmAction } = useModalContext();
  function handleSubmit(e) {
    e.preventDefault();
    confirmAction();
  }
  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <p>{message}</p>
      <button type="button" onClick={closeModal}>
        Cancel
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}

export default ConfirmationDialog;
