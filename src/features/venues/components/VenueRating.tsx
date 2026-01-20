// React imports
import { Icon } from '@iconify/react/dist/iconify.js';
import Rating from 'react-rating';

interface VenueRatingProps {
  initialRating?: number | null;
  readonly?: boolean;
  handleRatingChange?: (rating: number) => void;
  size?: string;
  variant?: 'star' | 'flame';
}

function VenueRating({
  initialRating,
  readonly,
  handleRatingChange,
  size = '24',
  variant = 'flame',
}: VenueRatingProps) {
  const ICON_VARIANTS = {
    flame: {
      full: (
        <Icon
          icon="f7:flame-fill"
          width={size}
          height={size}
          className="text-primary-500"
        />
      ),
      empty: (
        <Icon
          icon="f7:flame-fill"
          width={size}
          height={size}
          className="text-zinc-500"
        />
      ),
    },
    star: {
      full: (
        <Icon
          icon="tabler:star-filled"
          width={size}
          height={size}
          className="text-yellow-300"
        />
      ),
      empty: (
        <Icon
          icon="tabler:star-filled"
          width={size}
          height={size}
          className="text-gray-500"
        />
      ),
    },
  };

  const { full, empty } = ICON_VARIANTS[variant];

  return (
    <Rating
      initialRating={initialRating || 0}
      onChange={(value: number) => handleRatingChange?.(value)}
      readonly={readonly}
      emptySymbol={empty}
      fullSymbol={full}
      fractions={2}
    />
  );
}

export default VenueRating;
