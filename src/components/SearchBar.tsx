import { useState } from 'react';

function SearchBar() {
  const [searchValue, setSearchValue] = useState('');
  console.log(searchValue);
  return (
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
  );
}

export default SearchBar;
