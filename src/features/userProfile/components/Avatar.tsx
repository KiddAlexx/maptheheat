import defaultAvatar from '../../../assets/default-avatar.png';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';

interface AvatarProps {
  userId: string;
  size?: string;
}

function Avatar({ userId, size = '2.8' }: AvatarProps) {
  const { userProfile, isLoading } = useGetUserProfile(userId);

  return (
    <div
      className="overflow-hidden rounded-full border-2 border-green-500 p-[2px]"
      style={{ width: `${size}rem`, height: `${size}rem` }}
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
