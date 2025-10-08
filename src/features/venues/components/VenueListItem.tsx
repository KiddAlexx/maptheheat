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
import { useMatch } from 'react-router';
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

  const isUserMode = useMatch('/profile/venues');

  const { openDialog } = useModalContext();

  const {
    venueName,
    venueId,
    address,
    thumbnailImage,
    averageHeatRating,
    averageQualityRating,
    totalReviews,
  } = venue;

  const totalReviewCount = totalReviews ?? 0;

  const isFavourite = favVenuesList?.includes(venueId);

  const { updateFavouriteVenue } = useUpdateFavouriteVenue();

  function toggleFavourite() {
    if (!isAuthenticated || !userId) return;
    if (isUserMode) {
      openDialog(
        'Are you sure you want to remove this venue from your favourites?',
        () => {
          updateFavouriteVenue(
            { userId, venueId },
            {
              onSuccess: () => {
                const newFavouriteState = !isFavourite;
                newFavouriteState
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
            const newFavouriteState = !isFavourite;
            newFavouriteState
              ? toast.success(`${venueName} added to favourites!`)
              : toast.success(`${venueName} removed from favourites!`);
          },
        }
      );
    }
  }

  const finalHeatRating =
    averageHeatRating != null ? Math.round(averageHeatRating * 2) / 2 : 5;

  const finalQualityRating =
    averageQualityRating != null
      ? Math.round(averageQualityRating * 10) / 10
      : 5;

  return (
    <li>
      <button className="w-full" onClick={handleClick}>
        <Card
          className="mb-2 w-full cursor-pointer  shadow-md  transition hover:bg-primary-50"
          radius="sm"
        >
          <div className="flex">
            <div className="relative h-48 w-1/3">
              <Image
                className="h-full w-full object-cover"
                src={thumbnailImage?.url || greyChilli}
                alt={
                  thumbnailImage?.alt || 'a greyed out image of a chilli pepper'
                }
                removeWrapper
                radius="sm"
              />
            </div>
            <CardBody className="relative w-2/3">
              <h3 className="mb-2 text-lg font-medium">{venueName}</h3>

              {/* display flex is forced to override default display inline block
            of react rating - ensures icons allign correctly */}
              <div className="flex items-center gap-1 [&>span]:!flex">
                <VenueRating
                  initialRating={finalHeatRating}
                  readonly
                  size="20"
                />

                <span className="text-sm">
                  ({totalReviewCount}{' '}
                  {totalReviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Icon
                  className="text-yellow-600"
                  icon="lucide:star"
                  width={18}
                />
                <span className="text-small">({finalQualityRating})</span>
              </div>

              <div className="absolute right-4 top-4 z-10">
                <LikeButton
                  isFavourite={isFavourite}
                  isAuthenticated={isAuthenticated}
                  handleClick={toggleFavourite}
                />
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Icon icon="lucide:clock" width={15} />
                <span>Open</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Icon
                  icon="lucide:map-pin"
                  width={16}
                  className="flex-shrink-0"
                />
                <span className="truncate">{address}</span>
              </div>

              {/* Link to the detailed page of the venue. 
            On click, set clicked venue as active venue. */}
              <CardFooter>
                <Link
                  className="absolute bottom-3 right-4 z-10 text-sm text-blue-500"
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
      </button>
    </li>
  );
}

export default ListItem;
