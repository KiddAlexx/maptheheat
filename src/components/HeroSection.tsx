import CitySelect from '@/features/venues/components/CitySelect';
import { useVenueFilterContext } from '@/context/VenueFilterContext';
import AddVenueButton from '@/ui/AddVenueButton';

function HeroSection() {
  return (
    <section className=" grid flex-1 grid-cols-2 justify-items-center">
      <div className="max-w-3xl self-center px-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
          Find the <span className="text-primary-500">spiciest</span>{' '}
          restaurants and shops in your city.
        </h1>

        <div className="mt-8 w-full rounded-xl  border border-gray-200 bg-white p-5 shadow-md">
          <p className="mb-3 ml-1 text-sm font-medium text-slate-700">
            Where are you exploring today?
          </p>
          <CitySelect useVenueContext={useVenueFilterContext} />
          <div className=" flex items-center justify-between">
            <p className="ml-1 text-sm text-slate-700">
              Your city not listed yet?
            </p>
            <AddVenueButton className="h-9 min-w-28 bg-primary-500 text-sm font-semibold text-primary-50" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
