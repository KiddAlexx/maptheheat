import HeroSection from '../components/HeroSection';
import BackgroundBlobs from '@/ui/BackgroundBlobs';

function Homepage() {
  return (
    <main className="relative flex flex-1 flex-col bg-gradient-to-b from-primary-50 via-orange-50/70 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <BackgroundBlobs />
      <HeroSection />
    </main>
  );
}

export default Homepage;
