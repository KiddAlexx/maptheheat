// React imports
import { useState } from 'react';

// Third party imports
import slugify from 'slugify';
import { useForm } from 'react-hook-form';
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
} from '@nextui-org/react';

// Style imports
import styles from '../styles/VenueForm.module.css';

// Type imports

// Hooks imports

import { useCreateVenue } from '../hooks/useCreateVenue';
import { useUser } from '../../authentication/useUser';

// Component imports
import LoaderSpinner from '../../../ui/LoaderSpinner';
import ErrorModal from '../../../ui/ErrorModal';

// Data imports
import countries from '../../../shared/data/countries.json';
import ImageUploader from '@/components/ImageUploader';

function VenueForm() {
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
  const { createVenue, isCreating } = useCreateVenue();

  const { user } = useUser();

  const [localFormError, setLocalFormError] = useState('');
  const [formIndex, setFormIndex] = useState(1);
  const [createdVenue, setCreatedVenue] = useState(null);

  const { register, handleSubmit, formState } = useForm<FormData>();
  const { errors } = formState;

  // Fetches coordinates + detailed address from user input
  async function fetchAddressDetails(formData: FormData) {
    const { address, postcode, country, city } = formData;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?street=${address}&city=${city}&country=${country}&postalcode=${postcode}&format=json`
      );
      const [data] = await res.json(); // Take first result from array in case of multiple
      return {
        detailedAddress: data.display_name,
        coords: { lat: data.lat, lon: data.lon },
      };
    } catch (err) {
      throw new Error(
        "Couldn't find address. Please confirm that the details are correct"
      );
    }
  }

  async function formSubmit(formData: FormData) {
    console.log(formData);
    try {
      // Fetch detailed address + cooridinates
      const additionalVenueData = await fetchAddressDetails(formData);

      // Remove spaces and dashes from phoneNumber before adding
      const phoneNumber = formData.phoneNumber
        .replaceAll(' ', '')
        .replaceAll('-', '');

      // Compile complete venue data
      const finalVenueData = {
        ...formData,
        phoneNumber,
        ...additionalVenueData,
        userId: user!.id, // Value will not be null, checks done prior, further validation to be added
        venueNameSlug: slugify(formData.venueName).toLowerCase(),
      };

      // Add final venue data to supabase table
      const newVenue = await createVenue(finalVenueData);
      setCreatedVenue(newVenue);
      console.log(createdVenue);
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
        <form
          onSubmit={handleSubmit(formSubmit, toastFormError)}
          className={styles.venueFormContainer}
        >
          {isCreating ? (
            <LoaderSpinner />
          ) : (
            <>
              <div className={styles.inputContainer}>
                <Select
                  id="venueType"
                  label="Venue Type"
                  labelPlacement="outside"
                  placeholder="Choose Venue Type"
                  isInvalid={!!errors.venueType}
                  errorMessage={
                    errors.venueType &&
                    typeof errors?.venueType?.message === 'string'
                      ? errors.venueType.message
                      : ''
                  }
                  {...register('venueType', {
                    required: 'This field is required',
                  })}
                >
                  <SelectItem key="restaurant">Restaurant</SelectItem>
                  <SelectItem key="shop">Shop</SelectItem>
                </Select>
              </div>
              <div className={styles.inputContainer}>
                <Input
                  id="venueName"
                  type="text"
                  label="Venue Name"
                  labelPlacement="outside"
                  placeholder="Venue Name..."
                  radius="sm"
                  isInvalid={!!errors.venueName}
                  errorMessage={
                    errors.venueName &&
                    typeof errors?.venueName?.message === 'string'
                      ? errors.venueName.message
                      : ''
                  }
                  {...register('venueName', {
                    required: 'This field is required',
                    maxLength: {
                      value: 100,
                      message: 'Venue name cannot be more than 100 characters',
                    },
                  })}
                />
              </div>
              <div className={styles.inputContainer}>
                <Input
                  id="address"
                  type="text"
                  label="Address"
                  labelPlacement="outside"
                  placeholder="Number followed by street name..."
                  radius="sm"
                  isInvalid={!!errors.address}
                  errorMessage={
                    errors.address &&
                    typeof errors?.address?.message === 'string'
                      ? errors.address.message
                      : ''
                  }
                  {...register('address', {
                    required: 'This field is required',
                  })}
                />
              </div>
              <div className={styles.inputContainer}>
                <Input
                  id="postcode"
                  type="text"
                  label="Postcode"
                  labelPlacement="outside"
                  placeholder="Postcode..."
                  radius="sm"
                  isInvalid={!!errors.postcode}
                  errorMessage={
                    errors.postcode &&
                    typeof errors?.postcode?.message === 'string'
                      ? errors.postcode.message
                      : ''
                  }
                  {...register('postcode', {
                    required: 'This field is required',
                  })}
                />
              </div>
              <div className={styles.inputContainer}>
                <Input
                  id="city"
                  type="text"
                  label="City"
                  labelPlacement="outside"
                  placeholder="City..."
                  radius="sm"
                  isInvalid={!!errors.city}
                  errorMessage={
                    errors.city && typeof errors?.city?.message === 'string'
                      ? errors.city.message
                      : ''
                  }
                  {...register('city', { required: 'This field is required' })}
                />
              </div>

              <Autocomplete
                defaultItems={countries}
                labelPlacement="outside"
                label="Country"
                radius="sm"
                id="country"
                {...register('country', {
                  required: 'This field is required',
                })}
              >
                {(country) => (
                  <AutocompleteItem key={country.code}>
                    {country.name}
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <div className={styles.inputContainer}>
                <Textarea
                  id="description"
                  label="Description"
                  labelPlacement="outside"
                  placeholder="Please enter a detailed description of the venue..."
                  radius="sm"
                  isInvalid={!!errors.description}
                  errorMessage={
                    errors.description &&
                    typeof errors?.description?.message === 'string'
                      ? errors.description.message
                      : ''
                  }
                  {...register('description', {
                    required: 'This field is required',
                    minLength: {
                      value: 40,
                      message:
                        'Description must be at least 40 characters long',
                    },
                  })}
                />
              </div>
              {/*  <div className={styles.inputContainer}>
          <label htmlFor="hours">Opening Hours</label>
          <input
            type="text"
            name="hours"
            onChange={handleChange}
            value={hours}
            id="hours"
          />
        </div> */}
              {/* Add again once have proper input method */}
              <div className={styles.inputContainer}>
                <Input
                  id="phoneNumber"
                  type="text"
                  label="Phone Number"
                  labelPlacement="outside"
                  placeholder="Phone Number..."
                  radius="sm"
                  isInvalid={!!errors.phoneNumber}
                  errorMessage={
                    errors.phoneNumber &&
                    typeof errors?.phoneNumber?.message === 'string'
                      ? errors.phoneNumber.message
                      : ''
                  }
                  {...register('phoneNumber', {
                    required: 'This field is required',
                    pattern: {
                      value: /^\+?[0-9\s-]+$/,
                      message: 'Invalid phone number',
                    },
                    minLength: {
                      value: 9,
                      message: 'Phone Number must be at least 9 digits long',
                    },
                  })}
                />
              </div>
              <div className={styles.inputContainer}>
                <Input
                  id="website"
                  type="text"
                  label="Website"
                  labelPlacement="outside"
                  placeholder="http://www.example.com..."
                  radius="sm"
                  isInvalid={!!errors.website}
                  errorMessage={
                    errors.website &&
                    typeof errors?.website?.message === 'string'
                      ? errors.website.message
                      : ''
                  }
                  {...register('website', {
                    pattern: {
                      value:
                        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                      message: 'Invalid web address',
                    },
                  })}
                />
              </div>
              <div className={styles.venueButtonContainer}>
                <Button
                  // ***************** Add functionality to reset form and navigate back
                  type="button"
                  className={`btn-default ${styles.btnCancel}`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={`btn-default ${styles.btnSubmit}`}
                >
                  Submit
                </Button>
              </div>
            </>
          )}
        </form>
      )}
      {formIndex === 2 && (
        <div>
          <h2>Add photos for {createdVenue?.venueName ?? ''}</h2>
          <ImageUploader venue={createdVenue} />
        </div>
      )}
    </>
  );
}

export default VenueForm;
