// Third Party Imports
import slugify from 'slugify';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

// React imports
import { useState, Fragment } from 'react';

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
import { Icon } from '@iconify/react';
import ActionButton from '@/ui/ActionButton';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ErrorModal from '@/ui/ErrorModal';
import ImageUploader from '@/components/ImageUploader';

// Type imports
import type { Venue } from '@/types/venueTypes';

// Data imports
import countries from '@/shared/data/countries.json';

const CUISINE_TYPES = [
  'Indian',
  'Mexican',
  'Thai',
  'Chinese',
  'Korean',
  'Caribbean',
  'Ethiopian',
  'Middle Eastern',
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

  const [localFormError, setLocalFormError] = useState('');
  const [formIndex, setFormIndex] = useState(1);
  const [createdVenue, setCreatedVenue] = useState<Venue | null>(null);

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
  } = useForm<FormData>({ defaultValues: defaultFormValues });

  const selectedCuisines = watch('cuisines');
  const selectedDietary = watch('dietaryOptions');

  // Fetches coordinates + detailed address from user input
  async function fetchAddressDetails(formData: FormData) {
    const { address, postcode, country, city } = formData;
    try {
      const resVenue = await fetch(
        `https://nominatim.openstreetmap.org/search?street=${address}&city=${city}&country=${country}&postalcode=${postcode}&format=jsonv2`
      );
      const [venueData] = await resVenue.json(); // Take first result from array in case of multiple

      // Fetch central coordinates for city.
      const resCity = await fetch(
        `https://nominatim.openstreetmap.org/search.php?city=${city}&country=${country}&format=jsonv2`
      );
      const [cityData] = await resCity.json();
      return {
        venueAddress: {
          detailedAddress: venueData.display_name,
          coords: { lat: venueData.lat, lon: venueData.lon },
        },
        cityAddress: {
          coords: { lat: cityData.lat, lon: cityData.lon },
          city,
          country,
        },
      };
    } catch {
      throw new Error(
        "Couldn't find address. Please confirm that the details are correct"
      );
    }
  }

  async function goToStep2() {
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

      // Fetch detailed address + coordinates
      const additionalVenueData = await fetchAddressDetails(trimmedFormData);

      // Remove spaces and dashes from phoneNumber before adding
      const phoneNumber = formData.phoneNumber
        .replaceAll(' ', '')
        .replaceAll('-', '');

      // Compile complete venue data
      const finalVenueData = {
        ...trimmedFormData,
        phoneNumber,
        ...additionalVenueData.venueAddress,
        userId: user!.id, // Value will not be null, checks done prior, further validation to be added
        venueNameSlug: slugify(formData.venueName).toLowerCase(),
      };

      // Add final venue data to supabase table
      const newVenue = await createVenue(finalVenueData);
      setCreatedVenue(newVenue);

      // Adds city details to unique_cities table if entry does not already exist.
      await createUniqueCity(additionalVenueData.cityAddress);

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

  const steps = [
    { index: 1, label: 'Venue Details' },
    { index: 2, label: 'About' },
    { index: 3, label: 'Photos' },
  ];

  return (
    <>
      <ErrorModal
        errorMessage={localFormError}
        clearLocalError={() => setLocalFormError('')}
      />

      <div className="z-10 w-full max-w-4xl">
        {/* Step indicator */}
        <div className="mb-6 flex items-start">
          {steps.map((step, i) => (
            <Fragment key={step.index}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${
                    formIndex > step.index
                      ? 'bg-primary text-white'
                      : formIndex === step.index
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {formIndex > step.index ? (
                    <Icon aria-hidden="true" icon="lucide:check" width={14} />
                  ) : (
                    step.index
                  )}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    formIndex === step.index
                      ? 'font-medium text-primary'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 mb-5 mt-4 h-0.5 flex-1 transition ${
                    formIndex > step.index ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </Fragment>
          ))}
        </div>

        {formIndex === 1 && (
          <div>
            <h2 className="text-2xl font-semibold">Add a New Venue</h2>

            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
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
                          base: 'mb-12',
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
                    <div className="mb-12">
                      <label
                        htmlFor="country"
                        className="text-md mb-1 ml-1 block"
                      >
                        Country
                      </label>
                      <Autocomplete
                        {...field}
                        id="country"
                        placeholder="Select Country"
                        radius="full"
                        defaultItems={countries}
                        isInvalid={!!errors.country}
                        errorMessage={errors.country?.message}
                        onSelectionChange={(key) => field.onChange(key)}
                      >
                        {(country) => (
                          <AutocompleteItem key={country.name}>
                            {country.name}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                    </div>
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
                        value:
                          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
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
                        label="Website"
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

            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
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
                        <span className="text-xs text-gray-500">
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
                                    ? 'cursor-not-allowed border border-gray-300 bg-white text-gray-400 opacity-40'
                                    : 'border border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
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
                    <span className="text-xs text-gray-500">Optional</span>
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
                              : 'border border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
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
            <div className="mt-3 w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-4 shadow-md">
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
