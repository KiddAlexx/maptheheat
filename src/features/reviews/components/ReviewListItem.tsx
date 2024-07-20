import styles from '../styles/ReviewListItem.module.css';

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
    images,
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
    <article className={styles.reviewCardContainer}>
      <header className={styles.userInfo}>
        <Avatar userId={userId} />
        <div>
          <h3>{username}</h3>
          <p>({totalReviews} Reviews)</p>
        </div>
      </header>
      <section>
        <VenueRating initialRating={heatRating} readonly />
        <time dateTime={createdAt}> {formattedDate}</time>
        <h3>{reviewTitle}</h3>
        <p>{reviewContent}</p>
        {reviewType === 'shop' && (
          <p>
            <strong>Hottest Sauce: </strong>
            {hottestSauce}
          </p>
        )}
        {reviewType === 'restaurant' && (
          <p>
            <strong>Hottest Dish: </strong>
            {hottestDish}
          </p>
        )}
        {/* Displays option to edit review if current user is the 
        author of the review and it is within the 48 hour timeframe */}
        {within48hours && currentUser && (
          <Link
            className="btn-default"
            to={`/app/venue/${city}/${venueNameSlug}/reviews/edit/${reviewId}`}
          >
            Edit Review
          </Link>
        )}
        {/* Displays option to delete review if current user is the author of review*/}
        {currentUser && (
          <button onClick={handleDeleteReview} className="btn-default">
            Delete Review
          </button>
        )}
      </section>
    </article>
  );
}

export default ReviewListItem;
