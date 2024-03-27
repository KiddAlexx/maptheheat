import styles from './Avatar.module.css';
import defaultAvatar from '../assets/default-avatar.png';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';

function Avatar({ userId }) {
  const { userProfile, isLoading } = useGetUserProfile(userId);

  return (
    <img
      src={
        !isLoading && userProfile?.avatarUrl
          ? userProfile.avatarUrl
          : defaultAvatar
      }
      alt="users avatar"
      className={styles.avatar}
    />
  );
}

export default Avatar;
