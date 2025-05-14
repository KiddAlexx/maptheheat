// React imports
import { Icon } from '@iconify/react/dist/iconify.js';
import Rating from 'react-rating';

interface VenueRatingProps {
  initialRating?: number | null;
  readonly?: boolean;
  handleRatingChange?: (rating: number) => void;
  size?: string;
}

function VenueRating({
  initialRating,
  readonly,
  handleRatingChange,
  size = '24',
}: VenueRatingProps) {
  const fullFlame = (
    <Icon
      icon="f7:flame-fill"
      width={size}
      height={size}
      className="text-orange-600"
    />
  );

  const emptyFlame = (
    <Icon
      icon="f7:flame-fill"
      width={size}
      height={size}
      className="text-gray-500"
    />
  );

  return (
    <Rating
      initialRating={initialRating || 5}
      onChange={(value: number) => handleRatingChange?.(value)}
      readonly={readonly}
      emptySymbol={emptyFlame}
      fullSymbol={fullFlame}
      fractions={2}
    />
  );
}

export default VenueRating;
