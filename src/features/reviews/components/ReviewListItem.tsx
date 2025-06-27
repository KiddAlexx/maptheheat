import VenueRating from '../../venues/components/VenueRating';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import Avatar from '@/features/userProfile/components/Avatar';

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
} from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';

interface ReviewListItemProps {
  review: ReviewWithRelations;
}

// Component to render a single review item
function ReviewListItem({ review }: ReviewListItemProps) {
  const {
    profiles,
    venueDetails,
    createdAt,
    heatRating,
    hottestDish,
    hottestSauce,
    reviewContent,
    reviewType,
    reviewTitle,
    reviewId,
  } = review;

  const { username, totalReviews, userId } = profiles;
  const { city, venueNameSlug } = venueDetails;

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
    <article className="mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-md">
      <header className="flex justify-between">
        <div className="flex items-center gap-2">
          <Avatar userId={userId} />
          <div>
            <div className="mb-1 flex gap-1">
              <h3 className="font-semibold">{username}</h3>
              <p>
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="pt-[3px]">
                <VenueRating initialRating={heatRating} readonly size="20" />
              </div>
              <time dateTime={createdAt}> {formattedDate}</time>
            </div>
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
      </header>
      <Divider className="my-2" />
      <section>
        <h4 className="font mb-1 font-medium">{reviewTitle}</h4>
        <div className="flex gap-1">
          {/*       <Icon
            icon="lucide:message-square-text"
            width={20}
            height={20}
            className="mt-[2px] text-gray-500"
          /> */}
          <p className="mb-1">{reviewContent}</p>{' '}
        </div>
        <Divider className="my-2" />
        <div className="flex gap-1">
          {/*     <Icon
            icon="flowbite:pepper-hot-outline"
            width={20}
            height={20}
            className="text-orange-500"
          /> */}
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
        </div>
      </section>
    </article>
  );
}

export default ReviewListItem;
