import { Button } from '@heroui/react';
import CitySelect from '@/features/venues/components/CitySelect';
import { useVenueFilterContext } from '@/context/VenueFilterContext';
import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section
      className="grid h-[calc(100vh-5rem)] grid-cols-2 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(17, 21, 24, 0.233) 50%, rgba(17, 21, 24, 0.164) 100%), url('../../public/maptheheat-hero-sm.jpg')`,
      }}
    >
      <div className="flex flex-col items-center justify-center px-10 text-slate-50">
        <h1 className="mb-5 text-5xl">
          Uncover the Hottest Spots with MapTheHeat!
        </h1>
        <CitySelect useVenueContext={useVenueFilterContext} />
        <p className="text-3xl">
          Your city not listed yet? Add your favourite restaurant or shop here!
        </p>
        <div className="mt-2 self-end">
          <Button as={Link} to="/add-venue" radius="sm">
            Add new venue!
          </Button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
