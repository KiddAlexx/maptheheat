// React imports
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';

// Hooks imports
import { useVenue } from '../hooks/useVenue';
import { useCanUserReview } from '../../reviews/hooks/useCanUserReview';
import { useUser } from '../../authentication/hooks/useUser';
import { useModalContext } from '../../../context/ModalContext';
import { useGetReviews } from '@/features/reviews/hooks/useGetReviews';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';

// Component imports
import VenueRating from './VenueRating';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import ReviewContainer from '../../reviews/components/ReviewContainer';

// NextUI Component imports
import { Button, Divider, Image } from '@heroui/react';

// Type imports
import { Image as ImageType } from '../../../types/venueTypes';

// File imports
import greyChilli from '../../../assets/chilli-explosion-grey-md.jpg';

import { Icon } from '@iconify/react/dist/iconify.js';
import LikeButton from '@/ui/LikeButton';
import { useUpdateFavouriteVenue } from '@/features/userProfile/hooks/useUpdateFavouriteVenue';
import toast from 'react-hot-toast';
import ShareButton from '@/ui/ShareButton';

function DetailedVenueView() {
  const navigate = useNavigate();
  const { venueId } = useParams();

  const { openModal, openModalImages, openModalUpload, openDialog } =
    useModalContext();

  const { isAuthenticated, user } = useUser();
  const userId = user?.id;

  const { userProfile } = useGetUserProfile(userId);
  const username = userProfile?.username;
  const favVenuesList = userProfile?.favouriteVenues || null;
  const isFavourite = favVenuesList?.includes(venueId);

  // Passing empty strings to satisfy the query hook's required params
  // The query won't run unless `enabled` is true (ie user is authenticated)
  const { refetch: refetchUserPermission } = useCanUserReview(
    userId || '',
    venueId || '',
    30,
    false
  );

  const { isLoading: isLoadingReviews } = useGetReviews({ venueId });
  const { isLoading: isLoadingVenue, venue } = useVenue(venueId);
  const { updateFavouriteVenue } = useUpdateFavouriteVenue();

  if (!venueId || !venue) return null;

  if (isLoadingVenue || isLoadingReviews) {
    return <LoaderSpinner />;
  }

  const {
    venueName,
    city,
    venueNameSlug,
    phoneNumber,
    detailedAddress,
    website,
    description,
    averageHeatRating,
    averageQualityRating,
    venueImages,
    coords,
    totalReviews,
  } = venue;

  const { lat, lon } = coords;

  const finalHeatRating =
    averageHeatRating != null ? Math.round(averageHeatRating * 2) / 2 : 5;

  const finalQualityRating =
    averageQualityRating != null
      ? Math.round(averageQualityRating * 10) / 10
      : 5;

  const totalReviewCount = totalReviews ?? 0;

  console.log(venueImages);

  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

  async function handleReview() {
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
    // Check if user has left a review in the last 30 days for this venue
    const { data: canUserReview } = await refetchUserPermission();
    console.log('here is permission', canUserReview);
    if (canUserReview) {
      navigate(`/app/venue/${city}/${venueNameSlug}/reviews/new/${venueId}`);
    } else openDialog('You cannot review the same venue within 30 days');
  }

  function handleAddImages() {
    if (!venueId || !venue) return null;
    // Open login modal if not authenticated
    if (!isAuthenticated) {
      openModal('login');
      return;
    } else {
      openModalUpload({
        modal: 'image-uploader',
        venueId,
        city,
        venueNameSlug,
      });
    }
  }

  function toggleFavourite() {
    if (!isAuthenticated || !userId || !venueId) return;

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

  return (
    <div className="p-3 text-gray-800">
      <div className="mb-3 ml-1 flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-semibold">{venueName}</h2>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              <Icon className="text-yellow-600" icon="lucide:star" width={22} />
              <span className="text-small">({finalQualityRating})</span>
            </div>
            {/* display flex is forced to override default display inline block
            of react rating - ensures icons allign correctly */}
            <div className="flex items-center gap-1 [&>span]:!flex">
              <VenueRating initialRating={finalHeatRating} readonly />

              <span className="text-sm">
                ({totalReviewCount}{' '}
                {totalReviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        </div>
        <Button
          as={Link}
          color="primary"
          variant="flat"
          startContent={<Icon icon="lucide:map-pinned" />}
          to={`/app/map/${city}/${venueNameSlug}/${venueId}?&lat=${lat}&lon=${lon}`}
        >
          Back to Map
        </Button>
      </div>
      <article className="mb-5 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-md">
        <div
          className="mb-3 flex cursor-pointer gap-1"
          onClick={() =>
            venueImages
              ? openModalImages('image-carousel', venueImages)
              : handleAddImages()
          }
        >
          {venueImages && venueImages.length > 0 ? (
            // Slice first 4 images and map over
            venueImages.slice(0, 4).map((image: ImageType) => (
              <div
                key={image.url}
                className=" h-48 w-1/4 overflow-hidden rounded-xl "
              >
                <Image
                  className="h-full w-full  object-cover hover:scale-110"
                  src={image.url}
                  alt={image.alt}
                  radius="sm"
                  removeWrapper
                />
              </div>
            ))
          ) : (
            <div className=" h-48 w-1/4  overflow-hidden rounded-xl ">
              <Image
                className="h-full w-full  object-cover hover:scale-110"
                src={greyChilli}
                alt="an greyed out image of a chilli pepper"
                removeWrapper
                radius="sm"
              />
            </div>
          )}
        </div>
        {/* Temp data to test layout + styles !!!!!!!!!!!TO BE REPLACED!!!!!*/}
        <div className=" mt-4 flex justify-between">
          <div className="flex gap-2">
            {['Restaurant', 'Spanish', 'Mediterranean'].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mr-2 flex gap-1">
            <ShareButton
              shareUrl={`http://www.maptheheat.com/app/venue/${city}/${venueNameSlug}`}
            />
            <LikeButton
              isFavourite={isFavourite}
              isAuthenticated={isAuthenticated}
              handleClick={toggleFavourite}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2  ">
          <Icon icon="lucide:clock" width={18} />
          <span>Open</span>
        </div>
        {/* Calculate based on opening hours */}
        <div className="mt-3 flex items-center gap-2">
          <Icon icon="lucide:map-pin" width={18} />
          <span>{detailedAddress}</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Icon icon="lucide:phone" width={18} />
          <span>{phoneNumber}</span>
        </div>
        <div className="mb-6 mt-3 flex items-center gap-2">
          <Icon icon="material-symbols:globe" width={18} />
          <a
            className="text-blue-500  hover:text-blue-400"
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
          <p className="text-gray-700">{description}</p>
        </div>
        <div className="mb-7 flex gap-2">
          <Button
            as="a"
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            variant="flat"
            startContent={<Icon icon="lucide:navigation" />}
          >
            Get Directions
          </Button>
          <Button
            variant="flat"
            startContent={<Icon icon="lucide:message-circle" />}
            onPress={handleReview}
          >
            Leave a review
          </Button>
          <Button
            variant="flat"
            startContent={<Icon icon="lucide:image-plus" />}
            onPress={handleAddImages}
          >
            Add Images
          </Button>
        </div>
      </article>

      {totalReviewCount > 0 && <ReviewContainer mode="venue" />}
    </div>
  );
}

export default DetailedVenueView;
