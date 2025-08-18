// React imports
import { useNavigate } from 'react-router';

import { Button } from '@heroui/react';

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section
      className="grid h-[calc(100vh-5rem)] grid-cols-2 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(17, 21, 24, 0.233) 50%, rgba(17, 21, 24, 0.164) 100%), url('../../public/maptheheat-hero-sm.jpg')`,
      }}
    >
      <div className="flex flex-col items-center justify-center px-10 text-slate-50">
        <h1 className="mb-10 text-5xl">
          Uncover the Hottest Spots with MapTheHeat!
        </h1>
        <p className="text-3xl">
          Track down the top places for seriously spicy food. Made for true
          lovers of heat. Start exploring today!
        </p>
        <div className="flex gap-10">
          <Button onPress={() => navigate('app')}>Search Venues</Button>
          <Button onPress={() => navigate('app')}>Search Shops</Button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
