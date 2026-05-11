// Third Party Imports
import { useNavigate } from 'react-router-dom';

// Hooks
import { useGlobalError } from '@/context/ErrorContext';
import { useModalContext } from '@/context/ModalContext';
import { useUser } from '@/features/authentication/hooks/useUser';

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
  const { openDialog, openModal } = useModalContext();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  async function proceed() {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
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
