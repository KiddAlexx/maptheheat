import styles from '../styles/Avatar.module.css';
import defaultAvatar from '../../../assets/default-avatar.png';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';

interface AvatarProps {
  userId: string;
}

function Avatar({ userId }: AvatarProps) {
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
