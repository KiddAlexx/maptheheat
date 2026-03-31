import BackgroundBlobs from '@/ui/BackgroundBlobs';
import VenueForm from '../features/venues/components/VenueForm';

function AddNewVenue() {
  return (
    <main className="relative flex min-h-screen justify-center bg-gradient-to-b from-primary-50 to-white p-6">
      <BackgroundBlobs />
      <VenueForm />
    </main>
  );
}

export default AddNewVenue;
