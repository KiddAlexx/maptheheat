import styles from '../styles/ReviewListItem.module.css';
import defaultAvatar from '../../../assets/default-avatar.png';
import VenueRating from '../../venues/components/VenueRating';

function ReviewListItem({ review }) {
  const {
    profiles,
    createdAt,
    heatRating,
    hottestDish,
    hottestSauce,
    images,
    reviewContent,
    reviewType,
    reviewTitle,
  } = review;

  const { avatarUrl, username, totalReviews } = profiles;

  return (
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
        <time dateTime="2024-01-22"> 22/01/2004</time>
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
      </section>
    </article>
  );
}

export default ReviewListItem;
