// Third Party Imports
import { parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { useUIContext } from '@/context/UIContext';
import { Icon } from '@iconify/react/dist/iconify.js';

// Utils
import { formatDate, withinTimeframe } from '@/utils/dateTimeHelpers';

// Hooks
import { useUser } from '../../authentication/hooks/useUser';
import { useDeleteReview } from '../hooks/useDeleteReview';
import { useModalContext } from '@/context/ModalContext';

// Assets
import greyChilli from '@/assets/chilli-explosion-grey-md.jpg';

// Components
import VenueRating from '../../venues/components/VenueRating';
import LoaderSpinner from '@/ui/LoaderSpinner';
import Avatar from '@/features/userProfile/components/Avatar';
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from '@heroui/react';
import ResponsiveImageGrid from '@/ui/ResponsiveImageGrid';

// Type imports
import type { ReviewWithRelations } from '@/types/reviewTypes';

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
    venueImages,
  } = review;

  const { username, totalReviews, userId } = profiles;
  const {
    city,
    country,
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
  const { isSmallScreen } = useUIContext();

  // Used to check if current user is the author of the review
  const currentUser = user?.id === userId;

  // Format date and time + use withinTimeFrame helper function
  // to check whether review was left within the last 48 hours
  const date = parseISO(createdAt);
  const formattedDate = formatDate(createdAt);
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
    <LoaderSpinner message="deleting review" />
  ) : (
    <article className="relative mt-2 flex flex-col hyphens-auto rounded-xl border border-app-border bg-app-card p-3 text-sm shadow-md sm:flex-row">
      <header className="flex justify-between gap-2">
        <div className="flex  items-center gap-2 sm:w-44">
          {isUserMode ? (
            <div className="h-16 w-16">
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
          <div className="flex gap-2 sm:block">
            <div className="mb-1 flex flex-col justify-between">
              <h3 className="font-semibold">
                {isUserMode ? venueName : username}
              </h3>
              <p className="text-xs">
                ({isUserMode ? totalVenueReviews : totalReviews}{' '}
                {totalReviews === 1 ? 'review' : 'reviews'})
              </p>
            </div>
            <div className="mr-5 sm:mr-0">
              <div
                data-value={heatRating}
                className=" -translate-x-[1px] sm:mt-2 [&>span]:!flex"
              >
                <VenueRating initialRating={heatRating} readonly size="20" />
              </div>
              <div
                role="group"
                aria-label={`Review quality rating ${qualityRating}`}
                className="mt-1 flex items-start gap-1 sm:mt-2"
              >
                <Icon
                  aria-hidden="true"
                  className="text-yellow-600"
                  icon="lucide:star"
                  width={18}
                />
                <span aria-hidden="true">({qualityRating})</span>
              </div>
            </div>
          </div>
        </div>
        {isSmallScreen ? <Divider orientation="vertical" /> : null}
      </header>
      {isSmallScreen ? null : (
        <Divider className="mt-2" orientation="horizontal" />
      )}

      <section className="mr-4 flex w-full justify-between gap-1 p-2 sm:ml-5">
        <div>
          <h4 className=" mb-1 font-medium">{reviewTitle}</h4>
          <p className="mb-2">{reviewContent}</p>
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
          <div className="mb-2 mt-1 text-xs">
            <time dateTime={createdAt}>{formattedDate}</time>
          </div>
          {venueImages?.length > 0 && (
            <ResponsiveImageGrid images={venueImages} height={7} />
          )}
        </div>
      </section>
      <Dropdown>
        <DropdownTrigger className="absolute right-0 top-1">
          <Button radius="full"
            aria-label="Open review actions"
            isIconOnly
            variant="light"
            className="ml-2"
          >
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
                to={`/app/venue/${city}/${country}/${venueNameSlug}/reviews/edit/${reviewId}`}
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
    </article>
  );
}

export default ReviewListItem;
