import { Profile } from '@/types/userTypes';
import Avatar from './Avatar';
import { Icon } from '@iconify/react/dist/iconify.js';

interface UserProfileBannerProps {
  userProfile: Profile;
}

function UserProfileBanner({ userProfile }: UserProfileBannerProps) {
  const { userId, username, totalReviews, totalVenuesAdded } = userProfile;
  return (
    <header className="mb-4 flex items-center gap-3">
      <div>
        <Avatar userId={userId} size="7" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold">{username}</h2>
        <div className="mt-2 flex gap-3">
          <div className="flex  gap-1">
            <Icon className="text-yellow-600" icon="lucide:star" width={18} />
            <div>{totalReviews ?? 0}</div>
            <div>
              {totalReviews && totalReviews == 1 ? 'Review ' : 'Reviews '}
              Created
            </div>
          </div>
          <div className="flex  gap-1">
            <Icon icon="lucide:map-pin" width={18} className="text-green-600" />
            <div>{totalVenuesAdded ?? 0}</div>
            <div>
              {totalVenuesAdded && totalVenuesAdded == 1 ? 'Venue ' : 'Venues '}
              Added
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default UserProfileBanner;
