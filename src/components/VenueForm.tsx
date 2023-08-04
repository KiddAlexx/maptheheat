import { useState } from 'react';

function VenueForm() {
  const [venueData, setVenueData] = useState({
    name: '',
    address: '',
    description: '',
    hours: '',
    city: '',
  });

  const { name, address, description, hours, city } = venueData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVenueData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(venueData);
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
      <label htmlFor="address">Address</label>
      <input
        type="text"
        name="address"
        onChange={handleChange}
        value={address}
        id="address"
      />
      <label htmlFor="description">Description</label>
      <input
        type="text"
        name="description"
        onChange={handleChange}
        value={description}
        id="description"
      />
      <label htmlFor="hours">Hours</label>
      <input
        type="text"
        name="hours"
        onChange={handleChange}
        value={hours}
        id="hours"
      />
      <button type="submit" className="btn-default">
        Submit
      </button>
    </form>
  );
}

export default VenueForm;
