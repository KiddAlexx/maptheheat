import { Button } from '@nextui-org/react';
import { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function LikeButton() {
  const [isFavourite, setIsFavourite] = useState(false);
  return (
    <Button
      /*  className={`${
        isFavourite ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'
      } `} */
      isIconOnly
      variant="ghost"
      radius="full"
      onPress={() => setIsFavourite(!isFavourite)}
    >
      {isFavourite ? <FaHeart color="red" /> : <FaRegHeart />}
    </Button>
  );
}

export default LikeButton;
