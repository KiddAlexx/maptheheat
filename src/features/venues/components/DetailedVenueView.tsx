// React imports
import { useNavigate, useParams } from 'react-router';

// Style imports
import styles from '../styles/DetailedVenueView.module.css';

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
import { Button, Divider, Link } from '@heroui/react';

// Type imports
import { Image } from '../../../types/venueTypes';

// File imports
import greyChilli from '../../../assets/chilli-explosion-grey-md.jpg';

import { Icon } from '@iconify/react/dist/iconify.js';

function DetailedVenueView() {
  const navigate = useNavigate();
  const { venueId } = useParams();

  const { openModal, openModalImages, openModalUpload, openDialog } =
    useModalContext();

  const { isAuthenticated, user } = useUser();
  const userId = user?.id;

  const { userProfile } = useGetUserProfile(userId);
  const username = userProfile?.username;

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
    averageRating,
    images,
    coords,
    totalReviews,
  } = venue;

  const { lat, lon } = coords;

  const finalRating =
    averageRating != null ? Math.round(averageRating * 2) / 2 : 5;

  const totalReviewCount = totalReviews ?? 0;

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
    } else alert('You cannot review the same venue within 30 days');
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

  return (
    <div className="p-3 text-gray-800">
      <h2 className="mb-1 text-2xl font-semibold">{venueName}</h2>
      <div className="flex items-center gap-1">
        <VenueRating initialRating={finalRating} readonly />
        <span className="pb-1 text-sm">
          ({totalReviewCount} {totalReviewCount === 1 ? 'review' : 'reviews'})
        </span>
      </div>
      <div
        className={styles.multipleImageContainer}
        onClick={() => images && openModalImages('image-carousel', images)}
      >
        {images && images.length > 0 ? (
          // Slice first 4 images and map over
          // To be replaced with more refined component
          images.slice(0, 4).map((image: Image) => (
            <div className={styles.mainImageContainer}>
              <img
                className={styles.imageMainSmall}
                src={image.url}
                alt={image.alt}
              />
            </div>
          ))
        ) : (
          <div className={styles.mainImageContainer}>
            <img
              className={styles.imageMainSmall}
              src={greyChilli}
              alt="an greyed out image of a chilli pepper"
            />
            <p className={styles.addPhotosText}>Add Photos</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2  ">
        <Icon icon="lucide:clock" width={24} />
        <span>Open</span>
      </div>
      {/* Calculate based on opening hours */}
      <div className="mt-3 flex items-center gap-2">
        <Icon icon="lucide:map-pin" width={24} />
        <span>{detailedAddress}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Icon icon="lucide:phone" width={24} />
        <span>{phoneNumber}</span>
      </div>
      <div className="mb-7 mt-3 flex items-center gap-2">
        <Icon icon="material-symbols:globe" width={24} />
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

        <Link
          href={`/app/map/${city}/${venueNameSlug}/${venueId}?&lat=${lat}&lon=${lon}`}
        >
          Back to Map
        </Link>
      </div>
      <Divider className="mb-7" />
      <ReviewContainer mode="venue" />
    </div>
  );
}

export default DetailedVenueView;
