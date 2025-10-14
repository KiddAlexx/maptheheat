// React imports
import { useState } from 'react';

// Third party imports
import slugify from 'slugify';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// NextUI Components
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';

// Type imports

// Hooks imports

import { useCreateVenue } from '../hooks/useCreateVenue';
import { useUser } from '../../authentication/hooks/useUser';

// Component imports
import LoaderSpinner from '../../../ui/LoaderSpinner';
import ErrorModal from '../../../ui/ErrorModal';

// Data imports
import countries from '../../../shared/data/countries.json';
import ImageUploader from '@/components/ImageUploader';
import { useCreateUniqueCity } from '../hooks/useCreateUniqueCity';
import { Venue } from '@/types/venueTypes';

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
}

function VenueForm() {
  const { createVenue, isCreating: isCreatingVenue } = useCreateVenue();
  const { createUniqueCity } = useCreateUniqueCity();

  const { user } = useUser();

  const [localFormError, setLocalFormError] = useState('');
  const [formIndex, setFormIndex] = useState(1);
  const [createdVenue, setCreatedVenue] = useState<Venue | null>(null);

  const defaultFormValues: FormData = {
    city: '',
    venueType: '',
    venueName: '',
    address: '',
    postcode: '',
    description: '',
    phoneNumber: '',
    website: '',
    country: '',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ defaultValues: defaultFormValues });

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
    } catch (err) {
      throw new Error(
        "Couldn't find address. Please confirm that the details are correct"
      );
    }
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

      setFormIndex(2);
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

  return (
    <>
      {localFormError && (
        <ErrorModal
          errorMessage={localFormError}
          clearLocalError={() => setLocalFormError('')}
        />
      )}
      {formIndex === 1 && (
        <div className="w-full max-w-4xl">
          <h2 className=" text-2xl font-semibold">Add a New Venue</h2>

          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3 shadow-md">
            <form onSubmit={handleSubmit(formSubmit, toastFormError)}>
              {isCreatingVenue ? (
                <LoaderSpinner />
              ) : (
                <>
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
                            label: 'text-md font-normal ',
                            base: 'mb-10',
                          }}
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
                            label: 'text-md font-normal ',
                            base: 'mb-10',
                          }}
                          id="venueName"
                          type="text"
                          label="Venue Name"
                          labelPlacement="outside"
                          placeholder="Venue Name..."
                          radius="sm"
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
                            label: 'text-md font-normal ',
                            base: 'mb-10',
                          }}
                          id="address"
                          type="text"
                          label="Address"
                          labelPlacement="outside"
                          placeholder="Number followed by street name..."
                          radius="sm"
                          isInvalid={!!errors.address}
                          errorMessage={errors.address?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      name="postcode"
                      control={control}
                      rules={{ required: 'This field is required' }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          classNames={{
                            label: 'text-md font-normal ',
                            base: 'mb-10',
                          }}
                          id="postcode"
                          type="text"
                          label="Postcode"
                          labelPlacement="outside"
                          placeholder="Postcode..."
                          radius="sm"
                          isInvalid={!!errors.postcode}
                          errorMessage={errors.postcode?.message}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Controller
                      name="city"
                      control={control}
                      rules={{ required: 'This field is required' }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          classNames={{
                            label: 'text-md font-normal ',
                            base: 'mb-4',
                          }}
                          id="city"
                          type="text"
                          label="City"
                          labelPlacement="outside"
                          placeholder="City..."
                          radius="sm"
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
                      <div className="mb-3">
                        <label htmlFor="country" className="text-md mb-1 block">
                          Country
                        </label>
                        <Autocomplete
                          {...field}
                          id="country"
                          placeholder="Select Country"
                          radius="sm"
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
                            label: 'text-md font-normal ',
                            base: 'mb-10',
                          }}
                          id="description"
                          label="Description"
                          labelPlacement="outside"
                          placeholder="Please enter a detailed description of the venue..."
                          radius="sm"
                          isInvalid={!!errors.description}
                          errorMessage={errors.description?.message}
                        />
                      )}
                    />
                  </div>

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
                          message:
                            'Phone Number must be at least 9 digits long',
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          classNames={{
                            label: 'text-md font-normal ',
                            base: 'mb-10',
                          }}
                          id="phoneNumber"
                          type="text"
                          label="Phone Number"
                          labelPlacement="outside"
                          placeholder="Phone Number..."
                          radius="sm"
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
                            label: 'text-md font-normal ',
                            base: 'mb-4',
                          }}
                          id="website"
                          type="text"
                          label="Website"
                          labelPlacement="outside"
                          placeholder="http://www.example.com..."
                          radius="sm"
                          isInvalid={!!errors.website}
                          errorMessage={errors.website?.message}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <Button
                      // ***************** Add functionality to reset form and navigate back
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Submit</Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
      {formIndex === 2 && (
        <div>
          <h2 className=" text-2xl font-semibold">
            Add photos for {createdVenue?.venueName ?? ''}
          </h2>
          <div className="mt-3 w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-3 shadow-md">
            <ImageUploader
              venue={createdVenue ?? undefined}
              mode="integrated"
              imageType="venue"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default VenueForm;
