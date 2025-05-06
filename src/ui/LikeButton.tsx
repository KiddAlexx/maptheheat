import { useModalContext } from '@/context/ModalContext';
import { Button } from '@heroui/react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface LikeButtonProps {
  isFavourite?: boolean;
  isAuthenticated: boolean;
  handleClick: (isFavourite: boolean) => void;
}

// LikeButton displays a heart icon indicating if an item is a favourite.
// isFavourite determines the initial state, and handleClick is triggered on click.
function LikeButton({
  isFavourite,
  isAuthenticated,
  handleClick,
}: LikeButtonProps) {
  const { openModal } = useModalContext();

  // Runs handleClick function, which receives current "stale" state
  // which is inverted to allign with update.
  // If user is not authenticated then login modal is opened.
  function handleFavouriteClick() {
    if (!isAuthenticated) {
      openModal('login');
      return;
    } else {
      handleClick(!isFavourite);
    }
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
      {isFavourite ? <FaHeart color="red" /> : <FaRegHeart />}
    </Button>
  );
}

export default LikeButton;
