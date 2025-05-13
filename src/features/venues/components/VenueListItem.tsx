// Hooks imports
import { useParamsAndNavigate } from '../../../hooks/useParamsAndNavigate';

// File imports
import greyChilli from '../../../assets/chilli-explosion-grey-md.jpg';

import { Icon } from '@iconify/react';

// Component imports
import VenueRating from './VenueRating';

// Type imports
import { Venue } from '../../../types/venueTypes';

import LikeButton from '@/ui/LikeButton';
import { useUpdateFavouriteVenue } from '@/features/userProfile/hooks/useUpdateFavouriteVenue';
import toast from 'react-hot-toast';
import { useModalContext } from '@/context/ModalContext';
import { useLocation } from 'react-router';
import { Card, CardBody, CardFooter, Image, Link } from '@heroui/react';

interface ListItemProps {
  venue: Venue;
  handleClick: () => void;
  userId: string | null;
  isAuthenticated: boolean;
  favVenuesList?: string[] | null;
}

function ListItem({
  venue,
  handleClick,
  userId,
  isAuthenticated,
  favVenuesList,
}: ListItemProps) {
  const setParamsAndNavigate = useParamsAndNavigate();
  const location = useLocation();

  const isUserMode = location.pathname === '/profile/venues';

  const { openDialog } = useModalContext();

  const { venueName, venueId, address, images, averageRating, totalReviews } =
    venue;

  const totalReviewCount = totalReviews ?? 0;

  const isFavourite = favVenuesList?.includes(venueId);

  const { updateFavouriteVenue } = useUpdateFavouriteVenue();

  function toggleFavourite(isFavouriteState: boolean) {
    if (!isAuthenticated || !userId) return;
    if (isUserMode) {
      openDialog(
        'Are you sure you want to remove this venue from your favourites?',
        () => {
          updateFavouriteVenue(
            { userId, venueId },
            {
              onSuccess: () => {
                isFavouriteState
                  ? toast.success(`${venueName} added to favourites!`)
                  : toast.success(`${venueName} removed from favourites!`);
              },
            }
          );
        }
      );
    } else {
      updateFavouriteVenue(
        { userId, venueId },
        {
          onSuccess: () => {
            isFavouriteState
              ? toast.success(`${venueName} added to favourites!`)
              : toast.success(`${venueName} removed from favourites!`);
          },
        }
      );
    }
  }

  const finalRating =
    averageRating != null ? Math.round(averageRating * 2) / 2 : 5;

  const mainImage = images?.[0];

  return (
    <Card
      className="mb-2 w-full border-r border-t border-s-violet-500 shadow-md"
      isHoverable
      isPressable
      onPress={handleClick}
      radius="sm"
    >
      <div className="flex">
        <div className="relative h-48 w-1/3">
          <Image
            className="h-full w-full object-cover"
            src={mainImage?.url || greyChilli}
            alt={mainImage?.alt || 'a greyed out image of a chilli pepper'}
            removeWrapper
            radius="sm"
          />
        </div>
        <CardBody className="relative w-2/3">
          <h3 className="mb-2 text-large font-medium">{venueName}</h3>
          <div className="flex items-center gap-1">
            <VenueRating initialRating={finalRating} readonly />
            <span className="pb-1 text-sm">
              ({totalReviewCount}{' '}
              {totalReviewCount === 1 ? 'Review' : 'Reviews'})
            </span>
          </div>
          <div className="absolute right-2 top-2 z-10">
            <LikeButton
              isFavourite={isFavourite}
              isAuthenticated={isAuthenticated}
              handleClick={toggleFavourite}
            />
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <Icon icon="lucide:clock" width={15} />
            <span>Open</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Icon icon="lucide:map-pin" width={16} />
            <span>{address}</span>
          </div>

          {/* Link to the detailed page of the venue. 
            On click, set clicked venue as active venue. */}
          <CardFooter>
            <Link
              className="absolute bottom-3 right-4 z-10 text-sm"
              color="primary"
              onPress={() => {
                setParamsAndNavigate(venue, 'venue');
              }}
              showAnchorIcon
            >
              More information!
            </Link>
          </CardFooter>
        </CardBody>
      </div>
    </Card>
  );
}

export default ListItem;
