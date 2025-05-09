import defaultAvatar from '../../../assets/default-avatar.png';
import { useGetUserProfile } from '@/features/userProfile/hooks/useGetUserProfile';

interface AvatarProps {
  userId: string;
}

function Avatar({ userId }: AvatarProps) {
  const { userProfile, isLoading } = useGetUserProfile(userId);

  return (
    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-green-500 p-[2px]">
      <img
        src={
          !isLoading && userProfile?.avatarUrl
            ? userProfile.avatarUrl
            : defaultAvatar
        }
        alt="users avatar"
        className="rounded-full object-cover"
      />
    </div>
  );
}

export default Avatar;
