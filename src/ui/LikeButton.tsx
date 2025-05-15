import { useModalContext } from '@/context/ModalContext';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';

interface LikeButtonProps {
  isFavourite?: boolean;
  isAuthenticated: boolean;
  handleClick: (isFavourite: boolean) => void;
  size?: string;
  iconFull?: string;
  iconEmpty?: string;
  iconFullColor?: string;
  iconEmptyColor?: string;
}

// LikeButton displays an icon indicating if an item is a favourite.
// isFavourite determines the initial state, and handleClick is triggered on click.
function LikeButton({
  isFavourite,
  isAuthenticated,
  handleClick,
  size = '20',
  iconFull = 'bi:heart-fill',
  iconEmpty = 'bi:heart',
  iconEmptyColor = 'text-gray-500',
  iconFullColor = 'text-rose-500',
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
      radius="none"
      className="h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
      isIconOnly
      disableAnimation
      onPress={() => handleFavouriteClick()}
    >
      {isFavourite ? (
        <Icon
          icon={iconFull}
          className={`${iconFullColor}`}
          width={size}
          height={size}
        />
      ) : (
        <Icon
          className={`${iconEmptyColor}`}
          icon={iconEmpty}
          width={size}
          height={size}
        />
      )}
    </Button>
  );
}

export default LikeButton;
