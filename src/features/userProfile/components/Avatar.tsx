import defaultAvatar from '../../../assets/default-avatar.webp';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';

interface AvatarProps {
  userId: string;
  className?: string;
  hasNotifications?: boolean;
}

function Avatar({ userId, className = 'w-11 h-11', hasNotifications = false }: AvatarProps) {
  const { userProfile, isLoading } = useGetUserProfile(userId);

  return (
    <div
      className={`overflow-hidden rounded-full border-2 p-[2px] ${hasNotifications ? 'border-success-500' : 'border-primary'} ${className}`}
    >
      <img
        src={
          !isLoading && userProfile?.avatarUrl
            ? userProfile.avatarUrl
            : defaultAvatar
        }
        alt="users avatar"
        className="h-full  w-full rounded-full object-cover"
      />
    </div>
  );
}

export default Avatar;
