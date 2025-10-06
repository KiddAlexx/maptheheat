import { useGlobalError } from '@/context/ErrorContext';
import { useModalContext } from '@/context/ModalContext';
import { canUserAddVenue } from '@/services/apiVenues';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

function AddVenueButton() {
  const { setGlobalError } = useGlobalError();
  const { openDialog } = useModalContext();
  const navigate = useNavigate();

  // Check if user has 2 or more pending venues
  async function handleAddVenue() {
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
    <Button onPress={handleAddVenue} radius="sm" className="bg-primary-400">
      Add new venue!
    </Button>
  );
}

export default AddVenueButton;
