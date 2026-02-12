import { DetailedImage } from '@/types/venueTypes';
import { Image } from '@heroui/react';
import { useModalContext } from '@/context/ModalContext';
import { useUIContext } from '@/context/UIContext';

interface ResponsiveImageGridProps {
  images?: DetailedImage[];
  height?: number;
}

type GridLayout = {
  grid: string;
  items: string[];
};

function ResponsiveImageGrid({
  images,
  height = 12,
}: ResponsiveImageGridProps) {
  const { openModalImages } = useModalContext();
  const { isXSmallScreen, isXlScreen, is2xlScreen } = useUIContext();

  if (!images) return;

  const totalImages = images.length;

  let n = 3;
  if (isXSmallScreen) n = 5;
  if (isXlScreen) n = 7;
  if (is2xlScreen) n = 9;

  const numImages = Math.min(n, totalImages);

  const gridLayoutMap: Record<number, GridLayout> = {
    1: {
      grid: 'grid-cols-1 grid-rows-1',
      items: ['col-span-1 row-span-1'],
    },
    2: {
      grid: 'grid-cols-2 grid-rows-1',
      items: ['col-span-1 row-span-1', 'col-span-1 row-span-1'],
    },
    3: {
      grid: 'grid-cols-2 grid-rows-2 lg:grid-cols-3',
      items: [
        'col-span-1 row-span-2',
        'col-span-1 row-span-1 lg:row-span-2',
        'col-span-1 row-span-1 lg:row-span-2',
      ],
    },
    4: {
      grid: 'grid-cols-4 grid-rows-2',
      items: [
        'col-span-1 row-span-2',
        'col-span-1 row-span-2',
        'col-span-1 row-span-2',
        'col-span-1 row-span-2',
      ],
    },
    5: {
      grid: 'grid-cols-4 grid-rows-2',
      items: [
        'col-span-1 row-span-2',
        'col-span-1 row-span-2',
        'col-span-1 row-span-2',
      ],
    },
    6: {
      grid: 'grid-cols-8 grid-rows-2',
      items: [
        'col-span-2 row-span-2',
        'col-span-2 row-span-2',
        'col-span-2 row-span-2',
        'col-span-1 row-span-2',
      ],
    },
    7: {
      grid: 'grid-cols-8 grid-rows-2',
      items: [
        'col-span-2 row-span-2',
        'col-span-2 row-span-2',
        'col-span-2 row-span-2',
      ],
    },
    8: {
      grid: 'grid-cols-9 grid-rows-2',
      items: [
        'col-span-1 row-span-2',
        'col-span-1 row-span-1',
        'col-span-1 row-span-1',
      ],
    },
    9: {
      grid: 'grid-cols-9 grid-rows-2',
      items: [
        'col-span-2 row-span-2',
        'col-span-2 row-span-2',
        'col-span-2 row-span-2',
      ],
    },
  };

  const gridLayout = gridLayoutMap[numImages];

  const carouselImagesLg = images.map((image) => ({
    url: image.imagePath.lg,
    alt: image.altText,
    id: image.imageId,
  }));

  return (
    <div
      className={`grid cursor-pointer gap-[2px] overflow-hidden rounded-xl ${gridLayout.grid} `}
      style={{ height: `${height}rem` }}
      onClick={() => openModalImages('image-carousel', carouselImagesLg)}
    >
      {
        // Slice images and map over
        images.slice(0, numImages).map((image, idx) => (
          <div
            key={image.imageId}
            className={`overflow-hidden ${gridLayout.items[idx]} `}
          >
            <Image
              className="h-full w-full  object-cover hover:scale-110"
              src={image.imagePath.sm}
              alt={image.altText}
              radius="none"
              removeWrapper
            />
          </div>
        ))
      }
    </div>
  );
}

export default ResponsiveImageGrid;
