import { Profile } from '@/types/userTypes';
import Avatar from './Avatar';
import styles from '../styles/UserProfileBanner.module.css';

interface UserProfileBannerProps {
  userProfile: Profile;
}

function UserProfileBanner({ userProfile }: UserProfileBannerProps) {
  const { userId, username, avatarUrl, totalReviews, totalVenuesAdded } =
    userProfile;
  return (
    <header className={styles.profileBanner}>
      <div className={styles.profileInfo}>
        <Avatar userId={userId} />
        <h2>{username}</h2>
      </div>
      <div className={styles.stats}>
        <div className={styles.statsItem}>
          <div className={styles.statNumber}>{totalReviews}</div>
          <div>Reviews Left</div>
        </div>
        <div className={styles.statsItem}>
          <div className={styles.statNumber}>{totalVenuesAdded}</div>
          <div>Venues Added</div>
        </div>
      </div>
    </header>
  );
}

export default UserProfileBanner;
