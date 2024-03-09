import { useModalContext } from '../context/ModalContext';
import LoginForm from '../features/authentication/LoginForm';
import SignupForm from '../features/authentication/SignupForm';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import Modal from '../ui/Modal';
import ImageCarousel from '@/ui/ImageCarousel';

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

    case 'image-carousel':
      Component = <ImageCarousel />;
      break;
    case 'confirm-action':
      Component = <ConfirmationDialog />;
      break;
    default:
      break;
  }

  return Component ? <Modal>{Component}</Modal> : null;
}

export default ModalManager;
