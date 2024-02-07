import { useModalContext } from '../context/ModalContext';
import LoginForm from '../features/authentication/LoginForm';
import SignupForm from '../features/authentication/SignupForm';
import Modal from '../ui/Modal';

function ModalManager() {
  const { modalName, modalOpen } = useModalContext();
  if (!modalOpen) return null;

  let Component = null;
  switch (modalName) {
    case 'login':
      Component = <LoginForm />;
      break;

    case 'sign-up':
      Component = <SignupForm />;
      break;
    default:
      break;
  }

  return Component ? <Modal>{Component}</Modal> : null;
}

export default ModalManager;
