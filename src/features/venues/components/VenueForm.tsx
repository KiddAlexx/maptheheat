// Third Party Imports
import slugify from 'slugify';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

// React imports
import { useState } from 'react';

// Hooks
import { useCreateVenue } from '../hooks/useCreateVenue';
import { useUser } from '../../authentication/hooks/useUser';
import { useCreateUniqueCity } from '../hooks/useCreateUniqueCity';
import { useModalContext } from '@/context/ModalContext';

// Components
import {
  Autocomplete,
  AutocompleteItem,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import { useMapboxSearch } from '../hooks/useMapboxSearch';
import type { MapboxFeature } from '../hooks/useMapboxSearch';
import ActionButton from '@/ui/ActionButton';
import StepIndicator from '@/ui/StepIndicator';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ErrorModal from '@/ui/ErrorModal';
import ImageUploader from '@/components/ImageUploader';

// Type imports
import type { Venue } from '@/types/venueTypes';

const CUISINE_TYPES = [
  'Indian',
  'Mexican',
  'Thai',
  'Chinese',
  'Korean',
  'Caribbean',
  'Ethiopian',
  'Middle Eastern',
  'South African',
  'Pakistani',
  'Sri Lankan',
  'Vietnamese',
  'Nepalese',
  'Indonesian / Malaysian',
  'West African',
  'Peruvian',
  'Japanese',
  'American / BBQ',
  'Turkish',
  'Bangladeshi',
  'Fusion',
];

const DIETARY_OPTIONS = [
  'Vegan options',
  'Vegetarian options',
  'Gluten-free options',
  'Halal',
  'Kosher',
];

interface FormData {
  city: string;
  venueType: 'shop' | 'restaurant';
  venueName: string;
  address: string;
  postcode: string;
  description: string;
  phoneNumber: string;
  website: string;
  country: string;
  cuisines: string[];
  dietaryOptions: string[];
}

function VenueForm() {
  const { createVenue, isCreating: isCreatingVenue } = useCreateVenue();
  const { createUniqueCity } = useCreateUniqueCity();
  const navigate = useNavigate();
  const { openDialog } = useModalContext();

  const { user } = useUser();
  const {
    suggestions,
    isLoading: isSearchingAddress,
    search,
    fetchCityCoords,
  } = useMapboxSearch();

  const [localFormError, setLocalFormError] = useState('');
  const [formIndex, setFormIndex] = useState(1);
  const [createdVenue, setCreatedVenue] = useState<Venue | null>(null);
  // Captures venue + city coords at address selection time — gates form progression
  // and replaces the Nominatim geocoding calls that previously happened on submit
  const [mapboxVenueData, setMapboxVenueData] = useState<{
    coords: { lat: number; lon: number };
    detailedAddress: string;
    cityCoords: { lat: number; lon: number };
  } | null>(null);

  const defaultFormValues: FormData = {
    city: '',
    venueType: 'restaurant', // *********temp set as restaurant to fix ts error **************
    venueName: '',
    address: '',
    postcode: '',
    description: '',
    phoneNumber: '',
    website: '',
    country: '',
    cuisines: [],
    dietaryOptions: [],
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<FormData>({ defaultValues: defaultFormValues, mode: 'onChange' });

  const selectedCuisines = watch('cuisines');
  const selectedDietary = watch('dietaryOptions');

  // Mapbox returns coordinates as [lon, lat] (GeoJSON order) — we reverse to match
  // our internal Coords type { lat, lon }
  async function handleAddressSelect(key: React.Key | null) {
    const feature = suggestions.find(
      (f: MapboxFeature) => f.place_name === key
    );
    if (!feature) return;

    const ctx = feature.context ?? [];
    const isPoi = feature.place_type.includes('poi');

    // Bare street results (no house number, not a POI) give imprecise street-centroid
    // coordinates — reject them and ask the user to include the building number
    if (!isPoi && !feature.address) {
      toast.error(
        'Please include the building number in your search, e.g. "10 Baker Street London"'
      );
      return;
    }

    const postcode = ctx.find((c) => c.id.startsWith('postcode'))?.text ?? '';
    // Prefer place (city) over locality (district/neighbourhood) — locality can be a sub-area of the city
    const city =
      ctx.find((c) => c.id.startsWith('place'))?.text ??
      ctx.find((c) => c.id.startsWith('locality'))?.text ??
      '';
    const country = ctx.find((c) => c.id.startsWith('country'))?.text ?? '';

    // For POI results, feature.address = house number, context 'address' = street name
    // For address results, feature.address = house number, feature.text = street name
    const streetName = isPoi
      ? ctx.find((c) => c.id.startsWith('address'))?.text ?? ''
      : feature.text;
    const street = `${feature.address ?? ''} ${streetName}`.trim() || feature.text;

    // Auto-fill venue name when a POI is selected (feature.text is the business name)
    if (isPoi) setValue('venueName', feature.text);

    const [lon, lat] = feature.geometry.coordinates;

    setValue('address', street);
    setValue('postcode', postcode);
    setValue('city', city);
    setValue('country', country);

    try {
      const cityCoords = await fetchCityCoords(city, country);
      setMapboxVenueData({
        coords: { lat, lon },
        detailedAddress: feature.place_name,
        cityCoords,
      });
    } catch {
      // Fallback to venue coords if city geocode fails
      setMapboxVenueData({
        coords: { lat, lon },
        detailedAddress: feature.place_name,
        cityCoords: { lat, lon },
      });
    }
  }

  async function goToStep2() {
    if (!mapboxVenueData) {
      toast.error('Please use the address search to find the venue');
      return;
    }
    const valid = await trigger([
      'venueType',
      'venueName',
      'address',
      'postcode',
      'city',
      'country',
      'phoneNumber',
      'website',
    ]);
    if (valid) setFormIndex(2);
  }

  async function formSubmit(formData: FormData) {
    try {
      const trimmedFormData = {
        ...formData,
        venueName: formData.venueName.trim(),
        address: formData.address.trim(),
        postcode: formData.postcode.trim(),
        city: formData.city.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
      };

      // Remove spaces and dashes from phoneNumber before adding
      const phoneNumber = formData.phoneNumber
        .replaceAll(' ', '')
        .replaceAll('-', '');

      // mapboxVenueData is guaranteed here — goToStep2 blocks progression if null
      const finalVenueData = {
        ...trimmedFormData,
        phoneNumber,
        detailedAddress: mapboxVenueData!.detailedAddress,
        coords: mapboxVenueData!.coords,
        userId: user!.id,
        venueNameSlug: slugify(formData.venueName).toLowerCase(),
      };

      const newVenue = await createVenue(finalVenueData);
      setCreatedVenue(newVenue);

      await createUniqueCity({
        city: trimmedFormData.city,
        country: trimmedFormData.country,
        coords: mapboxVenueData!.cityCoords,
      });

      setFormIndex(3);
    } catch (err) {
      if (err instanceof Error) {
        setLocalFormError(err.message);
      } else {
        setLocalFormError('An unexpected error occured');
      }
    }
  }

  function toastFormError() {
    toast.error('Please fix the errors in the form');
  }

  function toggleCuisine(value: string) {
    if (selectedCuisines.includes(value)) {
      setValue(
        'cuisines',
        selectedCuisines.filter((v) => v !== value),
        { shouldValidate: true }
      );
    } else if (selectedCuisines.length < 2) {
      setValue('cuisines', [...selectedCuisines, value], {
        shouldValidate: true,
      });
    }
  }

  function toggleDietary(value: string) {
    if (selectedDietary.includes(value)) {
      setValue(
        'dietaryOptions',
        selectedDietary.filter((v) => v !== value)
      );
    } else {
      setValue('dietaryOptions', [...selectedDietary, value]);
    }
  }

  const VENUE_FORM_STEPS = ['Venue Details', 'About', 'Photos'];

  return (
    <>
      <ErrorModal
        errorMessage={localFormError}
        clearLocalError={() => setLocalFormError('')}
      />

      <div className="z-10 w-full max-w-4xl">
        <StepIndicator labels={VENUE_FORM_STEPS} currentStep={formIndex} />

        {formIndex === 1 && (
          <div>
            <h2 className="text-2xl font-semibold">Add a New Venue</h2>

            <div className="mt-3 rounded-xl border border-app-border bg-app-card p-4 shadow-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  goToStep2();
                }}
              >
                <div>
                  <Controller
                    name="venueType"
                    control={control}
                    rules={{
                      required: ' This field is required',
                    }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        classNames={{
                          label: 'text-md font-normal ml-1',
                          base: 'mb-12 ',
                        }}
                        radius="full"
                        id="venueType"
                        label="Venue Type"
                        labelPlacement="outside"
                        placeholder="Choose Venue Type"
                        isInvalid={!!errors.venueType}
                        errorMessage={errors.venueType?.message}
                      >
                        <SelectItem key="restaurant">Restaurant</SelectItem>
                        <SelectItem key="shop">Shop</SelectItem>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name="venueName"
                    control={control}
                    rules={{
                      required: 'This field is required',
                      maxLength: {
                        value: 100,
                        message:
                          'Venue name cannot be more than 100 characters',
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        classNames={{
                          label: 'text-md font-normal ml-1',
                          base: 'mb-6',
                        }}
                        id="venueName"
                        type="text"
                        label="Venue Name"
                        labelPlacement="outside"
                        placeholder="Venue Name..."
                        radius="full"
                        isInvalid={!!errors.venueName}
                        errorMessage={errors.venueName?.message}
                      />
                    )}
                  />
                </div>
                <div>
                  <Autocomplete
                    label="Address Search"
                    labelPlacement="outside"
                    classNames={{ base: 'mb-6' }}
                    inputProps={{ classNames: { label: 'text-md font-normal ml-1' } }}
                    placeholder="Start typing the venue address..."
                    radius="full"
                    isLoading={isSearchingAddress}
                    onInputChange={search}
                    onSelectionChange={handleAddressSelect}
                    autoComplete="off"
                  >
                    {suggestions.map((f: MapboxFeature) => (
                      <AutocompleteItem key={f.place_name}>
                        {f.place_name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                </div>

                <div>
                  <Controller
                    name="address"
                    control={control}
                    rules={{ required: 'This field is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        classNames={{
                          label: 'text-md font-normal ml-1',
                          base: 'mb-6',
                        }}
                        id="address"
                        type="text"
                        label="Address"
                        labelPlacement="outside"
                        placeholder="Number followed by street name..."
                        radius="full"
                        isInvalid={!!errors.address}
                        errorMessage={errors.address?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <Controller
                    name="postcode"
                    control={control}
                    rules={{ required: 'This field is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        classNames={{
                          label: 'text-md font-normal ml-1',
                          base: 'mb-4',
                        }}
                        id="postcode"
                        type="text"
                        label="Postcode"
                        labelPlacement="outside"
                        placeholder="Postcode..."
                        radius="full"
                        isInvalid={!!errors.postcode}
                        errorMessage={errors.postcode?.message}
                      />
                    )}
                  />
                  <Controller
                    name="city"
                    control={control}
                    rules={{ required: 'This field is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        classNames={{
                          label: 'text-md font-normal ml-2',
                          base: 'mb-4',
                        }}
                        id="city"
                        type="text"
                        label="City"
                        labelPlacement="outside"
                        placeholder="City..."
                        radius="full"
                        isInvalid={!!errors.city}
                        errorMessage={errors.city?.message}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="country"
                  control={control}
                  rules={{ required: 'This field is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      classNames={{
                        label: 'text-md font-normal ml-1',
                        base: 'mb-12',
                      }}
                      id="country"
                      type="text"
                      label="Country"
                      labelPlacement="outside"
                      placeholder="Auto-filled from address search"
                      radius="full"
                      isInvalid={!!errors.country}
                      errorMessage={errors.country?.message}
                    />
                  )}
                />

                <div>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    rules={{
                      required: 'This field is required',
                      pattern: {
                        value: /^\+?[0-9\s-]+$/,
                        message: 'Invalid phone number',
                      },
                      minLength: {
                        value: 9,
                        message: 'Phone Number must be at least 9 digits long',
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        classNames={{
                          label: 'text-md font-normal ml-1',
                          base: 'mb-12',
                        }}
                        id="phoneNumber"
                        type="text"
                        label="Phone Number"
                        labelPlacement="outside"
                        placeholder="Phone Number..."
                        radius="full"
                        isInvalid={!!errors.phoneNumber}
                        errorMessage={errors.phoneNumber?.message}
                      />
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="website"
                    control={control}
                    rules={{
                      pattern: {
                        value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/\S*)?$/i,
                        message: 'Invalid web address',
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        classNames={{
                          label: 'text-md font-normal ml-1',
                          base: 'mb-4',
                        }}
                        id="website"
                        type="text"
                        label={
                          <>
                            Website{' '}
                            <span className="text-xs font-normal text-app-muted">
                              Optional
                            </span>
                          </>
                        }
                        labelPlacement="outside"
                        placeholder="http://www.example.com..."
                        radius="full"
                        isInvalid={!!errors.website}
                        errorMessage={errors.website?.message}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <ActionButton
                    intent="cancel"
                    onPress={() =>
                      openDialog('Do you want to discard this venue?', () =>
                        navigate('/app/map')
                      )
                    }
                    type="button"
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton intent="confirm" type="submit">
                    Next
                  </ActionButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {formIndex === 2 && (
          <div>
            <h2 className="text-2xl font-semibold">About the Venue</h2>

            <div className="mt-3 rounded-xl border border-app-border bg-app-card p-4 shadow-md">
              <form onSubmit={handleSubmit(formSubmit, toastFormError)}>
                {/* Cuisine Types */}
                <Controller
                  name="cuisines"
                  control={control}
                  rules={{
                    validate: (v) =>
                      v.length >= 1 ||
                      'Please select at least one cuisine type',
                  }}
                  render={() => (
                    <div className="mb-8">
                      <div className="mb-2 flex items-baseline gap-2">
                        <span className="text-md ml-1 font-normal">
                          Cuisine Type
                        </span>
                        <span className="text-xs text-app-muted">
                          Select 1 or 2
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CUISINE_TYPES.map((cuisine) => {
                          const isSelected = selectedCuisines.includes(cuisine);
                          const isDisabled =
                            !isSelected && selectedCuisines.length >= 2;
                          return (
                            <button
                              key={cuisine}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => toggleCuisine(cuisine)}
                              className={`rounded-full px-3 py-1 text-sm transition ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : isDisabled
                                    ? 'cursor-not-allowed border border-app-border bg-app-card text-app-muted opacity-40'
                                    : 'border border-app-border bg-app-card text-foreground hover:border-primary hover:text-primary'
                              }`}
                            >
                              {cuisine}
                            </button>
                          );
                        })}
                      </div>
                      {errors.cuisines && (
                        <p className="mt-2 text-xs text-danger">
                          {errors.cuisines.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Dietary Options */}
                <div className="mb-8">
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-md ml-1 font-normal">
                      Dietary Options
                    </span>
                    <span className="text-xs text-app-muted">Optional</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((option) => {
                      const isSelected = selectedDietary.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleDietary(option)}
                          className={`rounded-full px-3 py-1 text-sm transition ${
                            isSelected
                              ? 'bg-primary text-white'
                              : 'border border-app-border bg-app-card text-foreground hover:border-primary hover:text-primary'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Controller
                    name="description"
                    control={control}
                    rules={{
                      required: 'This field is required',
                      minLength: {
                        value: 40,
                        message:
                          'Description must be at least 40 characters long',
                      },
                      maxLength: {
                        value: 500,
                        message:
                          'Description can not be more than 500 characters long',
                      },
                    }}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        classNames={{
                          label: 'text-md font-normal ml-1 ',
                          base: 'mb-8',
                        }}
                        id="description"
                        label="Description"
                        labelPlacement="outside"
                        placeholder="Please enter a detailed description of the venue..."
                        radius="full"
                        isInvalid={!!errors.description}
                        errorMessage={errors.description?.message}
                      />
                    )}
                  />
                </div>

                <p className="mb-2 text-center text-xs text-app-muted">
                  By submitting you agree to our{' '}
                  <a
                    href="/terms"
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>
                  .
                </p>
                <div className="flex items-center justify-end gap-3">
                  {isCreatingVenue && (
                    <div>
                      <LoaderSpinner message="Adding venue" />
                    </div>
                  )}
                  <ActionButton
                    intent="cancel"
                    isDisabled={isCreatingVenue}
                    onPress={() => setFormIndex(1)}
                    type="button"
                  >
                    Back
                  </ActionButton>
                  <ActionButton
                    intent="confirm"
                    isDisabled={isCreatingVenue}
                    type="submit"
                  >
                    Submit
                  </ActionButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {formIndex === 3 && (
          <div>
            <h2 className="text-2xl font-semibold">
              Add photos for {createdVenue?.venueName ?? ''}
            </h2>
            <div className="mt-3 w-full max-w-4xl rounded-xl border border-app-border bg-app-card p-4 shadow-md">
              <ImageUploader
                venue={createdVenue ?? undefined}
                mode="integrated"
                imageType="venue"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default VenueForm;
