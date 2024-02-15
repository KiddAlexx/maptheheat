import styles from './ReviewListItem.module.css';
import defaultAvatar from '../../assets/default-avatar.png';
import VenueRating from '../venues/components/VenueRating';

function ReviewListItem() {
  return (
    <article className={styles.reviewCardContainer}>
      <header className={styles.userInfo}>
        <img src={defaultAvatar} alt="users avatar" className={styles.avatar} />
        <div>
          <h3>User Name</h3>
          <p>(15 Reviews)</p>
        </div>
      </header>
      <section>
        <VenueRating />
        <time dateTime="2024-01-22"> 22/01/2004</time>
        <h3>Review Title</h3>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestiae
          consequuntur itaque necessitatibus sequi sint aut accusantium esse!
          Veniam culpa quo et blanditiis ea dolorem voluptatibus, laudantium
          animi deserunt vitae libero.
        </p>
        <p>
          <strong>Hottest Sauce: </strong>Reaper Blast
        </p>
      </section>
    </article>
  );
}

export default ReviewListItem;
