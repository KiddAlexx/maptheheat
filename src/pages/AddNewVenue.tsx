import BackgroundBlobs from '@/ui/BackgroundBlobs';
import VenueForm from '../features/venues/components/VenueForm';

function AddNewVenue() {
  return (
    <main className="relative flex min-h-screen justify-center bg-gradient-to-b from-primary-50 via-orange-50/70 to-white p-6 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <BackgroundBlobs />
      <VenueForm />
    </main>
  );
}

export default AddNewVenue;
