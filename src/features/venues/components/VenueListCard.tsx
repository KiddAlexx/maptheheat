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

interface VenueListCardProps {
  venue: Venue;
  handleClick: () => void;
  userId: string | null;
  isAuthenticated: boolean;
  favVenuesList?: string[] | null;
}

function VenueListCard({
  venue,
  handleClick,
  userId,
  isAuthenticated,
  favVenuesList,
}: VenueListCardProps) {
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
      <button className=" w-full" onClick={handleClick}>
        <Card
          className="mb-2 h-48 w-full cursor-pointer bg-primary-50/50 shadow-md transition hover:bg-primary-50"
          radius="sm"
        >
          <div className="flex">
            <div className="relative h-48 w-1/3 ">
              <Image
                className="h-full w-full object-cover"
                src={thumbnailImage?.url || greyChilli}
                fallbackSrc={greyChilli}
                alt={
                  thumbnailImage?.alt || 'a greyed out image of a chilli pepper'
                }
                removeWrapper
                radius="sm"
              />
            </div>
            <CardBody className="relative w-2/3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-medium">{venueName}</h3>

                <LikeButton
                  isFavourite={isFavourite}
                  isAuthenticated={isAuthenticated}
                  handleClick={toggleFavourite}
                />
              </div>

              {/* display flex is forced to override default display inline block
            of react rating - ensures icons allign correctly */}
              <div className="mb-2 flex -translate-x-[1px] gap-1 [&>span]:!flex">
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

              <div className=" mb-2 flex items-start gap-1">
                <Icon
                  className="text-yellow-600"
                  icon="lucide:star"
                  width={18}
                />
                <span className="text-small">({finalQualityRating})</span>
              </div>

              <div className="mb-2 flex items-start gap-1 text-sm">
                <Icon icon="lucide:clock" width={16} className="shrink-0" />
                <span>Open</span>
              </div>

              <div className="mb-2 flex items-start gap-1 text-sm">
                <Icon icon="lucide:map-pin" width={16} className="shrink-0" />
                <span className="truncate">{address}</span>
              </div>

              <CardFooter>
                <Link
                  className="absolute bottom-3 right-2 z-10 text-sm text-blue-500"
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

export default VenueListCard;
