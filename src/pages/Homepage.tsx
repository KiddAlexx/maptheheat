import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import BackgroundBlobs from '@/ui/BackgroundBlobs';
import { PageSeo } from '@/lib/seo';

function Homepage() {
  return (
    <main className="relative flex flex-1 flex-col bg-gradient-to-b from-primary-50 via-orange-50/70 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <PageSeo
        title="MapTheHeat | Discover & Review Spicy Venues"
        description="MapTheHeat is a community-driven platform for discovering and sharing venues that serve spicy food. Browse an interactive map, read community heat ratings, sign in (including with Google) to save favourites, submit venues, upload photos, and manage your reviews."
      />
      <BackgroundBlobs />
      <HeroSection />
      <FeaturesSection />
    </main>
  );
}

export default Homepage;
