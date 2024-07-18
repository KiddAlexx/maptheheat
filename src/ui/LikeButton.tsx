import { Button } from '@nextui-org/react';
import { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface LikeButtonProps {
  isFavourite: boolean;
  handleClick: (isFavourite: boolean) => void;
}

// LikeButton displays a heart icon indicating if an item is a favourite.
// isFavourite determines the initial state, and handleClick is triggered on click.
function LikeButton({ isFavourite, handleClick }: LikeButtonProps) {
  const [isFavouriteState, setIsFavouriteState] = useState(isFavourite);

  // Toggles value of local state.
  // Runs handleClick function, which receives current "stale" state
  // which is inverted to allign with update.
  function handleFavouriteClick() {
    setIsFavouriteState(() => !isFavouriteState);
    handleClick(!isFavouriteState);
  }

  return (
    <Button
      /*  className={`${
        isFavourite ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'
      } `} */
      isIconOnly
      variant="ghost"
      radius="full"
      onPress={() => handleFavouriteClick()}
    >
      {isFavouriteState ? <FaHeart color="red" /> : <FaRegHeart />}
    </Button>
  );
}

export default LikeButton;
