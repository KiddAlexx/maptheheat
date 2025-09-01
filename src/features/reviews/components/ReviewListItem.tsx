import VenueRating from '../../venues/components/VenueRating';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import Avatar from '@/features/userProfile/components/Avatar';
import greyChilli from '../../../assets/chilli-explosion-grey-md.jpg';

import { useUser } from '../../authentication/hooks/useUser';
import { useDeleteReview } from '../hooks/useDeleteReview';
import { useModalContext } from '../../../context/ModalContext';

import { format, parseISO } from 'date-fns';

import { Link } from 'react-router-dom';

import { withinTimeframe } from '../../../utils/withinTimeframe';

import { ReviewWithRelations } from '@/types/reviewTypes';
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';

interface ReviewListItemProps {
  review: ReviewWithRelations;
  mode: 'venue' | 'user';
}

// Component to render a single review item
function ReviewListItem({ review, mode }: ReviewListItemProps) {
  const {
    profiles,
    venueDetails,
    createdAt,
    heatRating,
    qualityRating,
    hottestDish,
    hottestSauce,
    reviewContent,
    reviewType,
    reviewTitle,
    reviewId,
  } = review;

  const { username, totalReviews, userId } = profiles;
  const {
    city,
    venueNameSlug,
    thumbnailImage,
    venueName,
    totalReviews: totalVenueReviews,
  } = venueDetails;
  const isUserMode = mode === 'user';

  // Fetch data from hooks
  const { isDeleting, deleteReview } = useDeleteReview();
  const { openDialog } = useModalContext();
  const { user } = useUser();

  // Used to check if current user is the author of the review
  const currentUser = user?.id === userId;

  // Format date and time + use withinTimeFrame helper function
  // to check whether review was left within the last 48 hours
  const date = parseISO(createdAt);
  const formattedDate = format(date, 'dd MMM yyyy');
  const within48hours = withinTimeframe(date, 2);

  // Passes function to delete review to openDialog function which
  // displays modal with message provided and option to proceed or
  // cancel deletion
  function handleDeleteReview() {
    const deleteReviewWithId = () => deleteReview(reviewId);
    openDialog(
      'Are you sure you want to delete this review? This action is permanent!',
      deleteReviewWithId
    );
  }

  return isDeleting ? (
    <LoaderSpinner />
  ) : (
    <article className="mt-2 flex  rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-md">
      <header className="flex justify-between gap-2">
        <div className="flex w-44 items-center gap-2">
          {isUserMode ? (
            <div className="h-24">
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
          ) : (
            <Avatar userId={userId} />
          )}
          <div>
            <div className="mb-1">
              <h3 className="font-semibold">
                {isUserMode ? venueName : username}
              </h3>
              <p className="text-xs">
                ({isUserMode ? totalVenueReviews : totalReviews}{' '}
                {totalReviews === 1 ? 'review' : 'reviews'})
              </p>
            </div>
            <div /* className="flex items-center gap-1" */>
              <div className=" mt-2 [&>span]:!flex">
                <VenueRating initialRating={heatRating} readonly size="20" />
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Icon
                  className="text-yellow-600"
                  icon="lucide:star"
                  width={18}
                />
                <span>({qualityRating})</span>
              </div>
            </div>
          </div>
        </div>
        <Divider orientation="vertical" />
      </header>

      <section className="ml-5 flex w-full justify-between p-2">
        <div>
          <h4 className=" mb-1 font-medium">{reviewTitle}</h4>

          <p className="mb-2">{reviewContent}</p>

          {/* <Divider className="my-2" /> */}

          {reviewType === 'shop' && (
            <p>
              Hottest Sauce: <span>{hottestSauce}</span>
            </p>
          )}
          {reviewType === 'restaurant' && (
            <p>
              Hottest Dish: <span>{hottestDish}</span>
            </p>
          )}
          <div className="mt-1 text-xs">
            <time dateTime={createdAt}>{formattedDate}</time>
          </div>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light" className="ml-2">
              <Icon icon="lucide:more-vertical" className="h-5 w-5" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Review actions ">
            {within48hours && currentUser ? (
              <DropdownItem
                key="editReview"
                startContent={<Icon icon="lucide:edit" />}
              >
                <Link
                  to={`/app/venue/${city}/${venueNameSlug}/reviews/edit/${reviewId}`}
                >
                  Edit Review
                </Link>
              </DropdownItem>
            ) : null}
            {currentUser ? (
              <DropdownItem
                key="deleteReview"
                onPress={handleDeleteReview}
                className=" text-danger"
                startContent={<Icon icon="lucide:trash-2" />}
              >
                Delete Review
              </DropdownItem>
            ) : null}
          </DropdownMenu>
        </Dropdown>
      </section>
    </article>
  );
}

export default ReviewListItem;
