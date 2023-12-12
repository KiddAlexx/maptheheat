// React imports
import { useEffect, useState } from 'react';

// Firebase imports
import { auth } from '../config/firebase-config';

// Third party imports
import slugify from 'slugify';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Style imports
import styles from './VenueForm.module.css';

// Type imports
import { VenueFormProps } from './SideBar';

// Hooks imports
import { useRestaurants } from '../context/RestaurantContext';

// Component imports
import LoaderSpinner from './LoaderSpinner';
import ErrorModal from './ErrorModal';

function VenueForm({ setIsAddingVenue }: VenueFormProps) {
  // Functions from Restaurant Context
  const { isLoading } = useRestaurants();

  const [localFormError, setLocalFormError] = useState('');

  const { register, handleSubmit, watch, formState } = useForm();
  const { errors } = formState;

  const city = watch('city');
  const [country, setCountry] = useState('');

  // Assign country value based on chosen city
  useEffect(() => {
    if (city === 'Barcelona') {
      setCountry(() => 'Spain');
    }
    if (city === 'Madrid') {
      setCountry(() => 'Spain');
    }
    if (city === 'Glasgow') {
      setCountry(() => 'UK');
    }
    if (city === 'Edinburgh') {
      setCountry(() => 'UK');
    }
    if (city === 'London') {
      setCountry(() => 'UK');
    }
  }, [city]);

  // Fetches coordinates + detailed address from user input
  const fetchAddressDetails = async function (formData) {
    const { address, postcode } = formData;
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
  };

  const formSubmit = async function (formData) {
    try {
      const additionalVenueData = await fetchAddressDetails(formData);
      const currentTimeStamp = new Date().toISOString();
      console.log(formData);
      const finalVenueData = {
        country,
        ...formData,
        ...additionalVenueData,
        userId: auth!.currentUser!.uid, // Value will not be null, checks done prior, further validation to be added
        dateAdded: currentTimeStamp,
        urlSlug: slugify(formData.venueName),
      };
      /* addRestaurant(finalVenueData);  TEMP DISABLE*/

      console.log(finalVenueData);
      setIsAddingVenue(false);
    } catch (err) {
      setLocalFormError(err.message);
    }
  };

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
      <form
        onSubmit={handleSubmit(formSubmit, toastFormError)}
        className={styles.venueFormContainer}
      >
        {isLoading ? (
          <LoaderSpinner />
        ) : (
          <>
            <div className={styles.inputContainer}>
              <label htmlFor="city">City</label>
              <select
                id="city"
                {...register('city', { required: 'This field is required' })}
              >
                <option value="">Choose City</option>
                <option value="Barcelona">Barcelona</option>
                <option value="Madrid">Madrid</option>
                <option value="Glasgow">Glasgow</option>
                <option value="Edinburgh">Edinburgh</option>
                <option value="London">London</option>
              </select>
              {errors?.city?.message && <span>{errors.city.message}</span>}
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="venueName">Restaurant Name</label>
              <input
                type="text"
                placeholder="Restaurant Name..."
                id="venueName"
                {...register('venueName', {
                  required: 'This field is required',
                  maxLength: {
                    value: 100,
                    message:
                      'Restaurant name cannot be more than 100 characters',
                  },
                })}
              />
              {errors?.venueName?.message && (
                <span>{errors.venueName.message}</span>
              )}
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="address">Address - Number / Street Name</label>
              <input
                type="text"
                placeholder="Number followed by street name..."
                id="address"
                {...register('address', { required: 'This field is required' })}
              />
              {errors?.address?.message && (
                <span>{errors.address.message}</span>
              )}
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="postcode">Postcode</label>
              <input
                type="text"
                placeholder="Postcode..."
                id="postcode"
                {...register('postcode', {
                  required: 'This field is required',
                })}
              />{' '}
              {errors?.postcode?.message && (
                <span>{errors.postcode.message}</span>
              )}
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="description">Description</label>
              <textarea
                rows={2}
                placeholder="Please enter a detailed description of the restaurant..."
                id="description"
                {...register('description', {
                  required: 'This field is required',
                  minLength: {
                    value: 40,
                    message: 'Description must be at least 40 characters long',
                  },
                })}
              />
              {errors?.description?.message && (
                <span>{errors.description.message}</span>
              )}
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
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="text"
                placeholder="Phone Number..."
                id="phoneNumber"
                {...register('phoneNumber', {
                  required: 'This field is required',
                  pattern: {
                    value: /^\+?[0-9\s-]+$/,
                    message: 'Invalid phone number',
                  },
                })}
              />
              {errors?.phoneNumber?.message && (
                <span>{errors.phoneNumber.message}</span>
              )}
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="website">Website</label>
              <input
                type="text"
                placeholder="http://www.example.com..."
                id="website"
                {...register('website', {
                  pattern: {
                    value:
                      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                    message: 'Invalid web address',
                  },
                })}
              />
              {errors?.website?.message && (
                <span>{errors.website.message}</span>
              )}
            </div>
            <div className={styles.venueButtonContainer}>
              <button
                onClick={() => setIsAddingVenue(false)}
                type="button"
                className={`btn-default ${styles.btnCancel}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn-default ${styles.btnSubmit}`}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </form>
    </>
  );
}

export default VenueForm;
