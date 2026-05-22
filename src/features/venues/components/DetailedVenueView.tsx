// Third Party Imports
import { useNavigate, useParams } from 'react-router';
import { PageSeo } from '@/lib/seo';

// React imports
import { useEffect, useRef, useState } from 'react';

// Hooks
import { useVenue } from '../hooks/useVenue';
import { useUser } from '../../authentication/hooks/useUser';
import { useModalContext } from '@/context/ModalContext';
import { useGetReviews } from '@/features/reviews/hooks/useGetReviews';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';
import { useUpdateFavouriteVenue } from '@/features/userProfile/hooks/useUpdateFavouriteVenue';

import { useGlobalError } from '@/context/ErrorContext';
import { useParamsAndNavigate } from '@/hooks/useParamsAndNavigate';

// Assets
import greyChilli from '@/assets/chilli-explosion-grey-md.jpg';
import { Icon } from '@iconify/react/dist/iconify.js';

// Components
import VenueRating from './VenueRating';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import ReviewContainer from '../../reviews/components/ReviewContainer';
import { Button, Divider, Image } from '@heroui/react';
import LikeButton from '@/ui/LikeButton';
import ShareButton from '@/ui/ShareButton';
import ResponsiveImageGrid from '@/ui/ResponsiveImageGrid';

// Utils
import { canUserReview, checkPendingReviews } from '@/services/apiReviews';
import { canUserAddImage } from '@/services/apiVenues';
import { buildVenueShareUrl } from '@/utils/buildVenueShareUrl';

function DetailedVenueView() {
  const navigate = useNavigate();
  const setParamsAndNavigate = useParamsAndNavigate();
  const { venueId } = useParams();

  const { openModal, openModalUpload, openDialog } = useModalContext();

  const { isAuthenticated, user } = useUser();
  const userId = user?.id;

  const { userProfile } = useGetUserProfile(userId);
  const username = userProfile?.username;
  const favVenuesList = userProfile?.favouriteVenues || null;
  const isFavourite = favVenuesList?.includes(venueId) ?? false;
  const [optimisticIsFavourite, setOptimisticIsFavourite] =
    useState(isFavourite);

  const { isPending: isPendingReviews } = useGetReviews({ venueId });
  const { isPending: isLoadingVenue, venue } = useVenue(venueId);
  const venueHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const { setGlobalError } = useGlobalError();
  const { updateFavouriteVenue, isUpdating } = useUpdateFavouriteVenue();

  useEffect(() => {
    if (!venue) return;
    requestAnimationFrame(() => {
      venueHeadingRef.current?.focus();
    });
  }, [venueId, venue]);

  useEffect(() => {
    setOptimisticIsFavourite(isFavourite);
  }, [isFavourite]);

  if (isLoadingVenue || isPendingReviews) {
    return (
      <>
        <PageSeo
          title="Venue Details | MapTheHeat"
          description="Check heat ratings and community reviews for this spicy venue on MapTheHeat."
        />
        <LoaderSpinner message="Loading venue" />
      </>
    );
  }

  if (!venueId || !venue)
    return (
      <>
        <PageSeo
          title="Venue Not Found | MapTheHeat"
          description="This venue could not be found on MapTheHeat. Browse the map to discover spicy venues near you."
        />
        <div className="mx-auto mt-8 max-w-[70rem] p-3">
          <div
            role="alert"
            className="rounded-xl border border-app-border bg-app-card p-6 text-center shadow-md"
          >
            <h1 className="mb-2 text-xl font-semibold text-foreground">
              Venue not found
            </h1>
            <p className="text-app-muted">
              The venue you're looking for doesn't exist or may have been removed.
            </p>
            <div className="mt-4">
              <Button
                radius="full"
                variant="flat"
                color="primary"
                onPress={() => navigate(-1)}
              >
                Go back
              </Button>
            </div>
          </div>
        </div>
      </>
    );

  const {
    venueName,
    city,
    country,
    venueNameSlug,
    phoneNumber,
    address,
    detailedAddress,
    website,
    description,
    averageHeatRating,
    averageQualityRating,
    venueImages,
    coords,
    totalReviews,
    venueType,
    cuisines,
    dietaryOptions,
  } = venue;

  const { lat, lon } = coords;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName} ${address} ${city}`)}`;

  const finalHeatRating =
    averageHeatRating != null ? Math.round(averageHeatRating * 2) / 2 : 0;

  const finalQualityRating =
    averageQualityRating != null
      ? Math.round(averageQualityRating * 10) / 10
      : 0;

  const totalReviewCount = totalReviews ?? 0;

  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  const shareUrl = buildVenueShareUrl(venue) ?? '';

  async function handleReview() {
    if (!venueId) return null;
    // Open login modal if not authenticated
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    // Ask for for username if not set
    if (!username) {
      openDialog('Please choose a username to proceed', () =>
        navigate(`/profile/edit/username`)
      );
      return;
    }
    // Check if user has 2 or more pending reviews
    try {
      const underReviewLimit = await checkPendingReviews();
      if (!underReviewLimit) {
        return openDialog(
          'You already have 2 pending reviews. Please try again once these have been confirmed'
        );
      }
    } catch (err) {
      setGlobalError(`${err}`);
      return;
    }
    // Check if user has left a review in the last 30 days for this venue
    try {
      const withinDayLimit = await canUserReview(venueId);
      if (withinDayLimit) {
        navigate(
          `/app/venue/${city}/${country}/${venueNameSlug}/reviews/new/${venueId}`
        );
      } else openDialog('You cannot review the same venue within 30 days');
    } catch (err) {
      setGlobalError(`${err}`);
      return;
    }
  }

  async function handleAddImages() {
    if (!venueId || !venue) return null;
    // Open login modal if not authenticated
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    try {
      const underImageLimit = await canUserAddImage();
      if (underImageLimit) {
        openModalUpload({
          modal: 'image-uploader',
          venueId,
          city,
          venueNameSlug,
        });
      } else {
        openDialog(
          'You already have 6 or more pending images. Please try again once these have been confirmed'
        );
      }
    } catch (err) {
      setGlobalError(`${err}`);
      return;
    }
  }

  function toggleFavourite() {
    if (!isAuthenticated || !userId || !venueId || isUpdating) return;

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

  const seoTitle = `${venueName} in ${city} | MapTheHeat`;
  const seoDescription = `${venueName} in ${city} — check community heat ratings and reviews for this spicy venue on MapTheHeat.`;

  return (
    <>
    <PageSeo title={seoTitle} description={seoDescription} />
    <div className="hyphens-auto p-3">
      <article className="mb-5 rounded-xl border border-app-border bg-app-card px-4 py-3 text-sm shadow-md">
        <div className="mb-3 ml-1 flex items-end justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <h2
              ref={venueHeadingRef}
              tabIndex={-1}
              className="mb-1 text-2xl font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:mb-0"
            >
              {venueName}
            </h2>
            {/* Ratings grouped so they stay together when stacked on small screens */}
            <div className="flex items-center gap-2">
              {/* display flex is forced to override default display inline block
                of react rating - ensures icons allign correctly */}
              <div className="flex items-center gap-1 [&>span]:!flex">
                <VenueRating initialRating={finalHeatRating} readonly />
                <span className="text-sm">
                  ({totalReviewCount}{' '}
                  {totalReviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Icon
                  className="text-yellow-600"
                  icon="lucide:star"
                  width={22}
                />
                <span className="text-small">({finalQualityRating})</span>
              </div>
            </div>
          </div>
        </div>
        {venueImages && venueImages.length > 0 ? (
          <ResponsiveImageGrid images={venueImages} />
        ) : (
          <div
            onClick={() => handleAddImages()}
            className=" h-48 overflow-hidden rounded-xl "
          >
            <Image
              className="h-full w-full  object-cover hover:scale-110"
              src={greyChilli}
              alt="an greyed out image of a chilli pepper"
              removeWrapper
              radius="sm"
            />
          </div>
        )}

        {/* Temp data to test layout + styles !!!!!!!!!!!TO BE REPLACED!!!!!*/}
        <div className=" mt-4 flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              venueType
                ? venueType.charAt(0).toUpperCase() + venueType.slice(1)
                : null,
              ...(cuisines ?? []),
              ...(dietaryOptions ?? []),
            ]
              .filter(Boolean)
              .map((tag) => (
                <span
                  key={tag}
                  className="flex h-6 items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              aria-label="Back to map"
              radius="full"
              color="primary"
              variant="bordered"
              isIconOnly
              onPress={() => setParamsAndNavigate(venue, 'map')}
            >
              <Icon icon="lucide:map-pinned" width="18" />
            </Button>
            <ShareButton
              title="Check out this place I found on Map The Heat!"
              body={`Hey, \n\nI thought you'd like this venue I found on Map The Heat. \n\nCheck it out here:`}
              shareUrl={shareUrl}
            />
            <LikeButton
              isFavourite={optimisticIsFavourite}
              isAuthenticated={isAuthenticated}
              handleClick={toggleFavourite}
              isDisabled={isUpdating}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80"
          >
            <Icon
              aria-hidden="true"
              icon="lucide:clock"
              width={18}
              className="shrink-0"
            />
            <span className="text-app-link">View hours</span>
            <Icon
              aria-hidden="true"
              icon="lucide:external-link"
              width={14}
              className="text-app-link"
            />
          </a>
        </div>
        <div className="mt-3 flex items-start gap-2">
          <Icon
            aria-hidden="true"
            icon="lucide:map-pin"
            width={18}
            className="shrink-0"
          />
          <span>{detailedAddress}</span>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <Icon aria-hidden="true" icon="lucide:phone" width={18} />
          <span>{phoneNumber}</span>
        </div>
        <div className="mb-6 mt-3 flex  items-start gap-2">
          <Icon
            aria-hidden="true"
            icon="material-symbols:globe"
            width={18}
            className="shrink-0"
          />
          <a
            className="break-all text-app-link hover:opacity-80"
            href={website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {website}
          </a>
        </div>

        <Divider className="mb-7" />

        <div className="mb-4">
          <h2 className="mb-2 text-lg font-medium">About</h2>
          <p className="text-foreground">{description}</p>
        </div>
        <div className="mb-3 flex gap-2 ">
          <Button
            radius="full"
            color="primary"
            variant="flat"
            className="dark:bg-app-link/20 dark:text-app-link"
            startContent={
              <Icon className="hidden xs:block" icon="lucide:message-circle" />
            }
            onPress={handleReview}
          >
            Leave a review
          </Button>
          <Button
            radius="full"
            variant="flat"
            startContent={
              <Icon className="hidden xs:block" icon="lucide:image-plus" />
            }
            onPress={handleAddImages}
          >
            Add Images
          </Button>
          <Button
            radius="full"
            as="a"
            variant="flat"
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            startContent={
              <Icon className="hidden xs:block" icon="lucide:navigation" />
            }
          >
            Get Directions
          </Button>
        </div>
      </article>

      {totalReviewCount > 0 && <ReviewContainer mode="venue" />}
    </div>
    </>
  );
}

export default DetailedVenueView;
