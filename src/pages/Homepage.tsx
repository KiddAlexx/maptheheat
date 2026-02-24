import HomeFooter from '@/components/HomeFooter';
import HeroSection from '../components/HeroSection';

function Homepage() {
  return (
    <main className=" flex h-full flex-col bg-gradient-to-b from-primary-50 to-white">
      <HeroSection />
      <HomeFooter />
    </main>
  );
}

export default Homepage;
