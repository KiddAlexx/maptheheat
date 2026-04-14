// React imports
import { useEffect, useState } from 'react';

// Third Party Imports
import { useMatch } from 'react-router';
import { Card, CardBody, CardFooter, Image } from '@heroui/react';
import { Icon } from '@iconify/react';

// Hooks
import { useParamsAndNavigate } from '@/hooks/useParamsAndNavigate';
import { useUpdateFavouriteVenue } from '@/features/userProfile/hooks/useUpdateFavouriteVenue';
import { useModalContext } from '@/context/ModalContext';

// Assets
import greyChilli from '@/assets/chilli-explosion-grey-md.jpg';

// Components
import VenueRating from './VenueRating';
import LikeButton from '@/ui/LikeButton';

// Type imports
import type { Venue } from '@/types/venueTypes';

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
  const { updateFavouriteVenue, isUpdating } = useUpdateFavouriteVenue();
  const { openDialog } = useModalContext();

  const isUserMode = useMatch('/profile/venues');

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

  const isFavourite = favVenuesList?.includes(venueId) ?? false;
  const [optimisticIsFavourite, setOptimisticIsFavourite] =
    useState(isFavourite);

  useEffect(() => {
    setOptimisticIsFavourite(isFavourite);
  }, [isFavourite]);

  const finalHeatRating =
    averageHeatRating != null ? Math.round(averageHeatRating * 2) / 2 : 0;

  const finalQualityRating =
    averageQualityRating != null
      ? Math.round(averageQualityRating * 10) / 10
      : 0;

  // Create a unique id to be used on each main button
  // Used to assign accessible name
  const accMainButtonId = `select-venue-${venueId}`;

  function toggleFavourite() {
    if (!isAuthenticated || !userId || isUpdating) return;
    if (isUserMode) {
      openDialog(
        'Are you sure you want to remove this venue from your favourites?',
        () => {
          const previousFavourite = optimisticIsFavourite;
          const nextFavourite = !previousFavourite;
          setOptimisticIsFavourite(nextFavourite);

          updateFavouriteVenue(
            { userId, venueId },
            {
              onError: () => {
                setOptimisticIsFavourite(previousFavourite);
              },
            }
          );
        }
      );
    } else {
      const previousFavourite = optimisticIsFavourite;
      const nextFavourite = !previousFavourite;
      setOptimisticIsFavourite(nextFavourite);

      updateFavouriteVenue(
        { userId, venueId },
        {
          onError: () => {
            setOptimisticIsFavourite(previousFavourite);
          },
        }
      );
    }
  }

  return (
    <li>
      {/* <button className=" w-full" onClick={handleClick}> */}

      <Card
        className="mb-2 h-48 w-full  bg-primary-50/50 shadow-md transition hover:bg-primary-50"
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
                isFavourite={optimisticIsFavourite}
                isAuthenticated={isAuthenticated}
                handleClick={toggleFavourite}
                isDisabled={isUpdating}
              />
            </div>

            {/* display flex is forced to override default display inline block
            of react rating - ensures icons allign correctly */}
            <button
              type="button"
              className=" w-full cursor-pointer"
              onClick={handleClick}
              aria-labelledby={accMainButtonId}
            >
              <span id={accMainButtonId} hidden>
                Select venue {venueName}
              </span>
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
                  aria-hidden="true"
                  className="text-yellow-600"
                  icon="lucide:star"
                  width={18}
                />
                <span className="text-small">({finalQualityRating})</span>
              </div>

              <div className="mb-2 flex items-start gap-1 text-sm">
                <Icon
                  aria-hidden="true"
                  icon="lucide:clock"
                  width={16}
                  className="shrink-0"
                />
                <span>Open</span>
              </div>

              <div className="mb-2 flex items-start gap-1 text-sm">
                <Icon
                  aria-hidden="true"
                  icon="lucide:map-pin"
                  width={16}
                  className="shrink-0"
                />
                <span className="truncate">{address}</span>
              </div>
            </button>

            <CardFooter>
              <button
                type="button"
                className="absolute bottom-3 right-2 z-10 flex cursor-pointer items-center text-sm text-blue-500 underline hover:opacity-80"
                onClick={() => {
                  setParamsAndNavigate(venue, 'venue');
                }}
              >
                <span>More information</span>
                {
                  <Icon
                    aria-hidden="true"
                    icon="lucide:chevron-right"
                    width="16"
                    height="16"
                  />
                }
              </button>
            </CardFooter>
          </CardBody>
        </div>
      </Card>
    </li>
  );
}

export default VenueListCard;
