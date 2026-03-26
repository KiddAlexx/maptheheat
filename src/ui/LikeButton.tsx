import { useModalContext } from '@/context/ModalContext';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';

interface LikeButtonProps {
  isFavourite?: boolean;
  isAuthenticated: boolean;
  handleClick: () => void;
  isDisabled?: boolean;
  size?: string;
  iconFull?: string;
  iconEmpty?: string;
  iconFullColor?: string;
  iconEmptyColor?: string;
}

// LikeButton displays an icon indicating if an item is a favourite.
// isFavourite determines the initial state, and handleClick toggles parent state
function LikeButton({
  isFavourite,
  isAuthenticated,
  handleClick,
  isDisabled = false,
  size = '20',
  iconFull = 'bi:heart-fill',
  iconEmpty = 'bi:heart',
  iconEmptyColor = 'text-gray-500',
  iconFullColor = 'text-danger-500',
}: LikeButtonProps) {
  const { openModal } = useModalContext();

  // Runs handleClick function
  function handleFavouriteClick() {
    if (!isAuthenticated) {
      openModal('login');
      return;
    } else {
      handleClick();
    }
  }

  // For aria accessible label
  const label = isFavourite ? 'Remove from favourites' : 'Add to favourites';

  return (
    <Button
      radius="none"
      className="h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
      isIconOnly
      disableAnimation
      isDisabled={isDisabled}
      onPress={() => handleFavouriteClick()}
      type="button"
      aria-label={label}
    >
      {isFavourite ? (
        <Icon
          icon={iconFull}
          className={`${iconFullColor}`}
          width={size}
          height={size}
          aria-hidden="true"
        />
      ) : (
        <Icon
          className={`${iconEmptyColor}`}
          icon={iconEmpty}
          width={size}
          height={size}
          aria-hidden="true"
        />
      )}
    </Button>
  );
}

export default LikeButton;
