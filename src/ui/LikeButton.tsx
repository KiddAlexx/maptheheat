import { Button } from '@nextui-org/react';
import { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function LikeButton({ isFavourite, handleClick }) {
  const [isFavouriteState, setIsFavouriteState] = useState(isFavourite);

  function toggleFavourite() {
    handleClick();
    setIsFavouriteState(!isFavouriteState);
  }

  return (
    <Button
      /*  className={`${
        isFavourite ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'
      } `} */
      isIconOnly
      variant="ghost"
      radius="full"
      onPress={() => toggleFavourite()}
    >
      {isFavouriteState ? <FaHeart color="red" /> : <FaRegHeart />}
    </Button>
  );
}

export default LikeButton;
