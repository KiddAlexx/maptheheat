import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useModalContext } from '@/context/ModalContext';
import Modal from '@/ui/Modal';

function ImageCarousel() {
  const { images } = useModalContext();
  return (
    <Modal>
      <Carousel>
        <CarouselContent className="w-[66rem]">
          {images.map((image) => (
            <CarouselItem>
              <img src={image.url} alt={image.alt} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext id="firstElementToFocus" />
      </Carousel>
    </Modal>
  );
}

export default ImageCarousel;
