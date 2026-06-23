// Third Party Imports
import { useNavigate } from 'react-router-dom';

// Hooks
import { useGlobalError } from '@/context/ErrorContext';
import { useModalContext } from '@/context/ModalContext';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';

// Components
import { Button } from '@heroui/react';

// Utils
import { canUserAddVenue } from '@/services/apiVenues';

interface AddVenueButtonProps {
  className: string;
  closeOtherModals?: (then: () => void) => void;
}

function AddVenueButton({ closeOtherModals, className }: AddVenueButtonProps) {
  const { setGlobalError } = useGlobalError();
  const { openDialog, openModal, openUsernameModal } = useModalContext();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUser();
  const { userProfile } = useGetUserProfile(user?.id);
  const username = userProfile?.username;

  async function continueAddVenue() {
    try {
      const underVenueLimit = await canUserAddVenue();
      if (underVenueLimit) {
        navigate('/add-venue');
      } else {
        openDialog(
          'You already have 2 pending venues. Please try again once these have been confirmed'
        );
      }
    } catch (err) {
      setGlobalError(`${err}`);
    }
  }

  async function proceed() {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    // Ask for a username if not set, mirroring the review flow
    if (!username) {
      openUsernameModal(() => continueAddVenue());
      return;
    }
    await continueAddVenue();
  }

  function handleAddVenue() {
    if (closeOtherModals) {
      closeOtherModals(proceed);
    } else {
      proceed();
    }
  }

  return (
    <Button
      onPress={handleAddVenue}
      size="sm" radius="full"
      className={className}
      type="button"
    >
      Add Venue
    </Button>
  );
}

export default AddVenueButton;
