import { Profile } from '@/types/userTypes';
import Avatar from './Avatar';

interface UserProfileBannerProps {
  userProfile: Profile;
}

function UserProfileBanner({ userProfile }: UserProfileBannerProps) {
  const { userId, username, totalReviews, totalVenuesAdded } = userProfile;
  return (
    <header className="flex justify-around">
      <div className="flex flex-col items-center">
        <Avatar userId={userId} />
        <h2>{username}</h2>
      </div>
      <div className="flex items-center gap-20">
        <div>
          <div className="text-center">{totalReviews ?? 0}</div>
          <div>
            {totalReviews && totalReviews == 1 ? 'Review ' : 'Reviews '}Created
          </div>
        </div>
        <div>
          <div className="text-center">{totalVenuesAdded ?? 0}</div>
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
