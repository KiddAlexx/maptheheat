import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useModalContext } from '@/context/ModalContext';

function ImageCarousel() {
  const { images } = useModalContext();
  return (
    <Carousel>
      <CarouselContent className="max-w-2xl">
        {images.map((image) => (
          <CarouselItem
            key={image.id}
            className="flex items-center justify-center"
          >
            <img src={image.url} alt={image.alt} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext id="firstElementToFocus" />
    </Carousel>
  );
}

export default ImageCarousel;
