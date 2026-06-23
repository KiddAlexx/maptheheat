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
import UpdateUsernameForm from '@/features/userProfile/components/UpdateUsernameForm';

const ImageCarousel = lazy(() => import('@/ui/ImageCarousel'));
const ImageUploader = lazy(() => import('./ImageUploader'));

function ModalManager() {
  const { modalName, modalOpen, confirmAction } = useModalContext();

  let Component = null;
  if (modalOpen) switch (modalName) {
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
    case 'set-username':
      Component = (
        <div className="flex w-72 flex-col gap-6 sm:w-80">
          <header>
            <h2 className="text-2xl font-medium">Choose a username</h2>
            <p className="mt-2 text-sm text-app-muted">
              You need a username before you can continue.
            </p>
          </header>
          <UpdateUsernameForm onSuccess={confirmAction ?? undefined} />
        </div>
      );
      break;
    case 'confirm-action':
      Component = <ConfirmationDialog />;
      break;
    default:
      break;
  }

  return <Modal>{Component}</Modal>;
}

export default ModalManager;
