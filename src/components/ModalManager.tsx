// React imports
import { lazy, Suspense } from 'react';

// Hooks
import { useModalContext } from '@/context/ModalContext';

// Components

import ConfirmationDialog from '@/ui/ConfirmationDialog';
import Modal from '@/ui/Modal';
import LoaderSpinner from '@/ui/LoaderSpinner';

const ImageCarousel = lazy(() => import('@/ui/ImageCarousel'));
const ImageUploader = lazy(() => import('./ImageUploader'));

const LoginForm = lazy(
  () => import('@/features/authentication/components/LoginForm')
);
const SignupForm = lazy(
  () => import('@/features/authentication/components/SignupForm')
);
const ForgotPasswordForm = lazy(
  () => import('@/features/authentication/components/ForgotPasswordForm')
);

function ModalManager() {
  const { modalName, modalOpen } = useModalContext();
  if (!modalOpen) return null;

  let Component = null;
  switch (modalName) {
    case 'login':
      Component = (
        <Suspense fallback={<LoaderSpinner />}>
          <LoginForm />
        </Suspense>
      );
      break;
    case 'sign-up':
      Component = (
        <Suspense fallback={<LoaderSpinner />}>
          <SignupForm />
        </Suspense>
      );
      break;
    case 'forgot-password':
      Component = (
        <Suspense fallback={<LoaderSpinner />}>
          <ForgotPasswordForm />
        </Suspense>
      );
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
