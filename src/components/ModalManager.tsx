import { useModalContext } from '../context/ModalContext';

import SignupForm from '../features/authentication/components/SignupForm';
import ConfirmationDialog from '../ui/ConfirmationDialog';
import Modal from '../ui/Modal';
import ImageCarousel from '@/ui/ImageCarousel';
import ImageUploader from './ImageUploader';
import LoginForm from '@/features/authentication/components/LoginForm';
import ForgotPasswordForm from '@/features/authentication/components/ForgotPasswordForm';

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
    case 'forgot-password':
      Component = <ForgotPasswordForm />;
      break;

    case 'image-carousel':
      Component = <ImageCarousel />;
      break;
    case 'image-uploader':
      Component = <ImageUploader mode="modal" />;
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
