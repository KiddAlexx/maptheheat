import { Profile } from '@/types/userTypes';
import Avatar from './Avatar';
import styles from '../styles/UserProfileBanner.module.css';

interface UserProfileBannerProps {
  userProfile: Profile;
}

function UserProfileBanner({ userProfile }: UserProfileBannerProps) {
  const { userId, username, totalReviews, totalVenuesAdded } = userProfile;
  return (
    <header className={styles.profileBanner}>
      <div className={styles.profileInfo}>
        <Avatar userId={userId} />
        <h2>{username}</h2>
      </div>
      <div className={styles.stats}>
        <div className={styles.statsItem}>
          <div className={styles.statNumber}>{totalReviews ?? 0}</div>
          <div>
            {totalReviews && totalReviews == 1 ? 'Review ' : 'Reviews '}Created
          </div>
        </div>
        <div className={styles.statsItem}>
          <div className={styles.statNumber}>{totalVenuesAdded ?? 0}</div>
          <div>
            {totalVenuesAdded && totalVenuesAdded == 1 ? 'Venue ' : 'Venues '}
            Added
          </div>
        </div>
      </div>
    </header>
  );
}

export default UserProfileBanner;
