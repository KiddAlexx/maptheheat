// React imports
import { lazy, Suspense } from 'react';

// Hooks
import { useModalContext } from '@/context/ModalContext';

// Components

import ConfirmationDialog from '@/ui/ConfirmationDialog';
import Modal from '@/ui/Modal';
import LoaderSpinner from '@/ui/LoaderSpinner';
import LoginForm from '@/features/authentication/components/LoginForm';
import SignupForm from '@/features/authentication/components/SignupForm';
import ForgotPasswordForm from '@/features/authentication/components/ForgotPasswordForm';

const ImageCarousel = lazy(() => import('@/ui/ImageCarousel'));
const ImageUploader = lazy(() => import('./ImageUploader'));

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
      Component = (
        <Suspense fallback={<LoaderSpinner />}>
          <ImageCarousel />
        </Suspense>
      );
      break;
    case 'image-uploader':
      Component = (
        <Suspense fallback={<LoaderSpinner />}>
          <ImageUploader mode="modal" imageType="standalone" />
        </Suspense>
      );
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
