import { useState } from 'react';

function SearchBar({ setIsAddingVenue }) {
  const [searchValue, setSearchValue] = useState('');
  console.log(searchValue);
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
      <p>Can't find what you are looking for?</p>{' '}
      <button onClick={() => setIsAddingVenue(true)} className="btn-default">
        Add new restaurant!
      </button>
    </>
  );
}

export default SearchBar;
