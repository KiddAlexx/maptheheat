import { useEffect, useState } from 'react';
import { useRestaurants } from '../context/RestaurantContext';
import { auth } from '../config/firebase-config';

import slugify from 'slugify';
import { VenueFormProps } from './SideBar';

import styles from './VenueForm.module.css';

function VenueForm({ setIsAddingVenue }: VenueFormProps) {
  // Data to be used for new venue entry
  const [venueData, setVenueData] = useState({
    name: '',
    address: '',
    detailedAddress: '',
    description: '',
    hours: '',
    city: '',
    country: '',
    postcode: '',
    phoneNumber: '',
    website: '',
    userId: '',
    coords: { lat: '', lon: '' },
    urlSlug: '',
    images: [],
  });

  // Functions from Restaurant Context
  const { addRestaurant, getRestaurants } = useRestaurants();

  const {
    name,
    address,
    description,
    hours,
    city,
    postcode,
    country,
    phoneNumber,
    website,
  } = venueData;

  useEffect(() => {
    if (city === 'Barcelona') {
      setVenueData((prevVenueData) => ({ ...prevVenueData, country: 'Spain' }));
    }
    if (city === 'Madrid') {
      setVenueData((prevVenueData) => ({ ...prevVenueData, country: 'Spain' }));
    }
    if (city === 'Glasgow') {
      setVenueData((prevVenueData) => ({
        ...prevVenueData,
        country: 'UK',
      }));
    }
    if (city === 'Edinburgh') {
      setVenueData((prevVenueData) => ({
        ...prevVenueData,
        country: 'UK',
      }));
    }
    if (city === 'London') {
      setVenueData((prevVenueData) => ({
        ...prevVenueData,
        country: 'UK',
      }));
    }
  }, [city]);

  // Update venue data on each keystroke
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVenueData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Fetches coordinates + detailed address from user input
  const fetchAddressDetails = async function () {
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
      alert(err);
    }
  };

  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const additionalVenueData = await fetchAddressDetails();
    const currentTimeStamp = new Date().toISOString();
    const finalVenueData = {
      ...venueData,
      ...additionalVenueData,
      userId: auth!.currentUser!.uid, // Value will not be null, checks done prior, further validation to be added
      dateAdded: currentTimeStamp,
      urlSlug: slugify(venueData.name),
    };
    addRestaurant(finalVenueData);
    setIsAddingVenue(false);
    getRestaurants(); // Fetches restaurant list after new entry (to change in future)
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.venueFormContainer}>
        <div className={styles.inputContainer}>
          <label htmlFor="city">City</label>
          <select name="city" onChange={handleChange} value={city} id="city">
            <option value="">Choose City</option>
            <option value="Barcelona">Barcelona</option>
            <option value="Madrid">Madrid</option>
            <option value="Glasgow">Glasgow</option>
            <option value="Edinburgh">Edinburgh</option>
            <option value="London">London</option>
          </select>
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="venueName">Restaurant Name</label>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            value={name}
            id="venueName"
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="address">Address - Number / Street Name</label>
          <input
            type="text"
            name="address"
            onChange={handleChange}
            value={address}
            id="address"
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="postcode">Postcode</label>
          <input
            type="text"
            name="postcode"
            onChange={handleChange}
            value={postcode}
            id="postcode"
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="description">Description</label>
          <textarea
            rows="2"
            name="description"
            onChange={handleChange}
            value={description}
            id="description"
          ></textarea>
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="hours">Opening Hours</label>
          <input
            type="text"
            name="hours"
            onChange={handleChange}
            value={hours}
            id="hours"
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            onChange={handleChange}
            value={phoneNumber}
            id="phoneNumber"
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="website">Website</label>
          <input
            type="text"
            name="website"
            onChange={handleChange}
            value={website}
            id="website"
          />
        </div>
        <div className={styles.venueButtonContainer}>
          <button
            onClick={() => setIsAddingVenue(false)}
            type="button"
            className={`btn-default ${styles.btnCancel}`}
          >
            Cancel
          </button>
          <button type="submit" className={`btn-default ${styles.btnSubmit}`}>
            Submit
          </button>
        </div>
      </form>
    </>
  );
}

export default VenueForm;
