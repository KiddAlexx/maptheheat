import BackgroundBlobs from '@/ui/BackgroundBlobs';
import VenueForm from '../features/venues/components/VenueForm';
import { PageSeo } from '@/lib/seo';

function AddNewVenue() {
  return (
    <main className="relative flex min-h-screen justify-center bg-gradient-to-b from-primary-50 via-orange-50/70 to-white p-6 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <PageSeo
        title="Add a Venue | MapTheHeat"
        description="Submit a new spicy food venue to MapTheHeat. Share a restaurant or shop that serves hot, spicy dishes with the community and help others find the heat."
      />
      <h1 className="sr-only">Add a Venue</h1>
      <BackgroundBlobs />
      <VenueForm />
    </main>
  );
}

export default AddNewVenue;
