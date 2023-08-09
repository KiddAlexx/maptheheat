import { useEffect, useState } from 'react';
import { useRestaurants } from '../context/RestaurantContext';
import { auth } from '../config/firebase-config';
import slugify from 'slugify';

interface VenueFormProps {
  setIsAddingVenue: React.Dispatch<React.SetStateAction<boolean>>;
}

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
        country: 'Scotland',
      }));
    }
    if (city === 'Edinburgh') {
      setVenueData((prevVenueData) => ({
        ...prevVenueData,
        country: 'Scotland',
      }));
    }
    if (city === 'London') {
      setVenueData((prevVenueData) => ({
        ...prevVenueData,
        country: 'England',
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
      console.error(err);
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
    <form onSubmit={handleSubmit}>
      <label htmlFor="city">City</label>
      <select name="city" onChange={handleChange} value={city} id="city">
        <option value="">Choose City</option>
        <option value="Barcelona">Barcelona</option>
        <option value="Madrid">Madrid</option>
        <option value="Glasgow">Glasgow</option>
        <option value="Edinburgh">Edinburgh</option>
        <option value="London">London</option>
      </select>
      <label htmlFor="venueName">Restaurant Name</label>
      <input
        type="text"
        name="name"
        onChange={handleChange}
        value={name}
        id="venueName"
      />
      <label htmlFor="address">Address - number followed by street name</label>
      <input
        type="text"
        name="address"
        onChange={handleChange}
        value={address}
        id="address"
      />
      <label htmlFor="postcode">Postcode</label>
      <input
        type="text"
        name="postcode"
        onChange={handleChange}
        value={postcode}
        id="postcode"
      />
      <label htmlFor="description">Description</label>
      <input
        type="text"
        name="description"
        onChange={handleChange}
        value={description}
        id="description"
      />
      <label htmlFor="hours">Opening Hours</label>
      <input
        type="text"
        name="hours"
        onChange={handleChange}
        value={hours}
        id="hours"
      />
      <label htmlFor="phoneNumber">Phone Number</label>
      <input
        type="text"
        name="phoneNumber"
        onChange={handleChange}
        value={phoneNumber}
        id="phoneNumber"
      />
      <label htmlFor="website">Website</label>
      <input
        type="text"
        name="website"
        onChange={handleChange}
        value={website}
        id="website"
      />
      <button type="submit" className="btn-default">
        Submit
      </button>
      <button
        onClick={() => setIsAddingVenue(false)}
        type="button"
        className="btn-default"
      >
        Cancel
      </button>
    </form>
  );
}

export default VenueForm;
