import HomeFooter from '@/components/HomeFooter';
import HeroSection from '../components/HeroSection';
import BackgroundBlobs from '@/ui/BackgroundBlobs';

function Homepage() {
  return (
    <main className="relative flex h-full flex-col bg-gradient-to-b from-primary-50 via-orange-50/70 to-white">
      <BackgroundBlobs />
      <HeroSection />
      <HomeFooter />
    </main>
  );
}

export default Homepage;
