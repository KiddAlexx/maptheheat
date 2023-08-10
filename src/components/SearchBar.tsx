import { useState } from 'react';
import { auth } from '../config/firebase-config';
import { useNavigate } from 'react-router';
import { VenueFormProps } from './SideBar';

function SearchBar({ setIsAddingVenue }: VenueFormProps) {
  const [searchValue, setSearchValue] = useState('');
  console.log(searchValue);

  const navigate = useNavigate();

  return (
    <>
      <form>
        <input
          type="text"
          name="searchValue"
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button type="submit" className="btn-default">
          Search
        </button>
      </form>
      <p>Can't find what you are looking for?</p>
      <button
        onClick={() => {
          //Redirect to login page if user is not logged in
          if (!auth.currentUser) {
            navigate('/login');
          } else {
            //Used in Sidebar to conditionally render VenueForm when set to true
            setIsAddingVenue(true);
          }
        }}
        className="btn-default"
      >
        Add new restaurant!
      </button>
    </>
  );
}

export default SearchBar;
