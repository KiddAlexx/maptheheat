import { useGlobalError } from '@/context/ErrorContext';
import { useModalContext } from '@/context/ModalContext';
import { useUser } from '@/features/authentication/hooks/useUser';
import { canUserAddVenue } from '@/services/apiVenues';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

interface AddVenueButtonProps {
  isButton?: boolean;
}

function AddVenueButton({ isButton = false }: AddVenueButtonProps) {
  const { setGlobalError } = useGlobalError();
  const { openDialog, openModal } = useModalContext();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  // Check if user has 2 or more pending venues
  async function handleAddVenue() {
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
      return;
    }
  }

  return (
    <Button
      onPress={handleAddVenue}
      size="sm"
      radius="sm"
      className={
        isButton
          ? 'h-9 min-w-32 bg-primary-300 text-base font-medium text-primary-foreground'
          : 'h-auto bg-transparent px-0 text-xl font-medium text-primary-50 hover:text-primary-300 data-[hover=true]:bg-transparent'
      }
    >
      Add Venue
    </Button>
  );
}

export default AddVenueButton;
