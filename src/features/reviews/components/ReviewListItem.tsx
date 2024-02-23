import styles from '../styles/ReviewListItem.module.css';
import defaultAvatar from '../../../assets/default-avatar.png';
import VenueRating from '../../venues/components/VenueRating';
import { useUser } from '../../authentication/useUser';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { useDeleteReview } from '../hooks/useDeleteReview';
import { useModalContext } from '../../../context/ModalContext';
import { format, isAfter, parseISO, subHours } from 'date-fns';
import { Link } from 'react-router-dom';
import { withinTimeframe } from '../../../utils/withinTimeframe';

function ReviewListItem({ review }) {
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

  const { avatarUrl, username, totalReviews, userId } = profiles;
  const { city, urlSlug, venueId } = venueDetails;

  const { isDeleting, deleteReview } = useDeleteReview();

  const { openDialog } = useModalContext();

  const { user } = useUser();
  const currentUser = user?.id === userId;

  const date = parseISO(createdAt);
  const formattedDate = format(date, 'dd MMM yyyy');
  const within48hours = withinTimeframe(date, 2);

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
        <img
          src={avatarUrl ? avatarUrl : defaultAvatar}
          alt="users avatar"
          className={styles.avatar}
        />
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
        {within48hours && (
          <Link
            className="btn-default"
            to={`/app/venue/${city}/${urlSlug}/reviews/edit/${reviewId}`}
          >
            Edit Review
          </Link>
        )}
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
