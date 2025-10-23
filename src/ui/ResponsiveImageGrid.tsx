import { DetailedImage } from '@/types/venueTypes';
import { Image } from '@heroui/react';

import { useModalContext } from '@/context/ModalContext';
import { useUIContext } from '@/context/UIContext';

interface ResponsiveImageGridProps {
  images?: DetailedImage[];
}

function ResponsiveImageGrid({ images }: ResponsiveImageGridProps) {
  const { openModalImages } = useModalContext();
  const { isXSmallScreen, isXlScreen, is2xlScreen } = useUIContext();

  if (!images) return;

  const totalImages = images.length;

  let numImages = 3;
  if (isXSmallScreen) numImages = 5;
  if (isXlScreen) numImages = 7;
  if (is2xlScreen) numImages = 9;

  const carouselImagesLg = images.map((image) => ({
    url: image.imagePath.lg,
    alt: image.altText,
    id: image.imageId,
  }));

  const layoutMap = [
    'col-start-1 row-span-2 row-start-1 xs:row-span-2 xs:row-start-1 xl:col-span-2', // 1st
    'col-start-2 row-start-1 xs:row-span-2 xs:row-start-1 xl:col-span-2 xl:col-start-3', // 2nd
    'col-start-2 row-start-2 xs:col-start-3 xs:row-span-2 xs:row-start-1 xl:col-span-2 xl:col-start-5 2xl:col-span-1 2xl:col-start-5 2xl:row-span-1', // 3rd
    'col-start-4 row-start-1 xl:col-start-7 2xl:col-start-6 2xl:row-span-1', // 4th
    'col-start-4 row-start-2 xl:col-start-7 2xl:col-start-5 2xl:row-span-1', // 5th
    'col-start-8 row-start-1 2xl:col-start-6 2xl:row-span-1', // 6th
    'col-start-8 row-start-2 2xl:col-span-2 2xl:col-start-7 2xl:row-span-2 2xl:row-start-1', // 7th
    'col-start-9 row-start-1 ', // 8th
    'col-start-9 row-start-2 ', // 9th
  ];

  return (
    <div
      className="mb-3 grid h-48 cursor-pointer grid-cols-2 grid-rows-2 gap-[2px] overflow-hidden rounded-xl xs:grid-cols-4 xl:grid-cols-8 2xl:grid-cols-9"
      onClick={() => openModalImages('image-carousel', carouselImagesLg)}
    >
      {
        // Slice images and map over
        images.slice(0, numImages).map((image: DetailedImage, idx: number) => (
          <div
            key={image.imageId}
            className={`overflow-hidden ${layoutMap[idx]} `}
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
