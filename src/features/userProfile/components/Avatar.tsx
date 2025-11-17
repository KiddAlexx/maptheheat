import defaultAvatar from '../../../assets/default-avatar.png';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';

interface AvatarProps {
  userId: string;
  className?: string;
}

function Avatar({ userId, className = 'w-11 h-11' }: AvatarProps) {
  const { userProfile, isLoading } = useGetUserProfile(userId);

  return (
    <div
      className={`overflow-hidden rounded-full border-2 border-success-500 p-[2px] ${className}`}
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
