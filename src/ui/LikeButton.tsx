import { useModalContext } from '@/context/ModalContext';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';

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
  const prefersReducedMotion = useReducedMotion();

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
  const iconClassName = isFavourite ? iconFullColor : iconEmptyColor;

  return (
    <Button
      radius="none"
      className="h-auto w-auto min-w-0 overflow-visible bg-transparent p-0 shadow-none"
      isIconOnly
      disableAnimation
      isDisabled={isDisabled}
      onPress={() => handleFavouriteClick()}
      type="button"
      aria-label={label}
    >
      <motion.span
        className="inline-flex origin-center items-center justify-center"
        whileHover={
          prefersReducedMotion || isDisabled ? undefined : { scale: 1.08 }
        }
        whileTap={
          prefersReducedMotion || isDisabled ? undefined : { scale: 0.92 }
        }
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 22,
          mass: 0.7,
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={isFavourite ? 'liked' : 'unliked'}
            className="inline-flex items-center justify-center"
            initial={
              prefersReducedMotion ? false : { scale: 0.72, opacity: 0, y: 2 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { scale: 1, opacity: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 1 }
                : { scale: 0.72, opacity: 0, y: -2 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <Icon
              icon={isFavourite ? iconFull : iconEmpty}
              className={iconClassName}
              width={size}
              height={size}
              aria-hidden="true"
            />
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </Button>
  );
}

const MemoizedLikeButton = memo(LikeButton);

export default MemoizedLikeButton;
