import CitySelect from '@/features/venues/components/CitySelect';
import { useVenueFilterContext } from '@/context/VenueFilterContext';
import AddVenueButton from '@/ui/AddVenueButton';

import VenuePreviewContainer from '@/features/venues/components/VenuePreviewContainer';

function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl flex-1 items-center gap-6 pt-10 md:grid-cols-2 md:pt-16">
      <div className="mx-6">
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Find the <span className="text-primary-500">spiciest</span>{' '}
          restaurants and shops in your city.
        </h1>

        <div className="mt-8 w-full rounded-2xl border border-primary-100/80 bg-app-card/90 p-5 shadow-[0_20px_50px_-30px_rgba(122,37,21,0.45)] backdrop-blur-sm">
          {/*  <p className="mb-3 ml-1 text-sm font-medium text-slate-700">
            Where are you exploring today?
          </p> */}
          <CitySelect useVenueContext={useVenueFilterContext} />
          <div className=" flex items-center justify-between gap-2">
            <p className="ml-1 text-sm text-app-muted">
              Your city not listed yet?
            </p>
            <AddVenueButton className="h-9 min-w-28 bg-primary-500 text-sm font-semibold text-primary-50" />
          </div>
        </div>
      </div>
      <div className="mx-6 mb-6">
        <VenuePreviewContainer />
      </div>
    </section>
  );
}

export default HeroSection;
