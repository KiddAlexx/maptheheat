import { format, parseISO } from 'date-fns';

import { Profile } from '@/types/userTypes';
import Avatar from './Avatar';
import { Icon } from '@iconify/react/dist/iconify.js';

interface UserProfileBannerProps {
  userProfile: Profile;
  onEditClick?: () => void;
}

function UserProfileBanner({ userProfile, onEditClick }: UserProfileBannerProps) {
  const { userId, username, totalReviews, totalVenuesAdded, createdAt } = userProfile;
  return (
    <header className="mb-4 flex items-center gap-3">
      <div>
        <Avatar
          userId={userId}
          className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24"
        />
      </div>
      <div className="flex flex-1 items-start justify-between text-sm sm:text-base">
        <div>
          <h2 className="text-xl font-semibold md:text-2xl">{username}</h2>
          <div className="mt-2 flex gap-3">
            <div className="flex gap-1">
              <Icon
                aria-hidden="true"
                className="text-yellow-600"
                icon="lucide:star"
                width={18}
              />
              <div>{totalReviews ?? 0}</div>
              <div>
                {totalReviews && totalReviews == 1 ? 'Review' : 'Reviews'}
                <span className="hidden sm:inline"> Created</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Icon
                aria-hidden="true"
                icon="lucide:map-pin"
                width={18}
                className="text-green-600"
              />
              <div>{totalVenuesAdded ?? 0}</div>
              <div>
                {totalVenuesAdded && totalVenuesAdded == 1 ? 'Venue' : 'Venues'}
                <span className="hidden sm:inline"> Added</span>
              </div>
            </div>
          </div>
          {createdAt && (
            <p className="mt-1 ml-1 text-xs text-app-muted">
              Member since {format(parseISO(createdAt), 'MMMM yyyy')}
            </p>
          )}
        </div>
        {onEditClick && (
          <button
            onClick={onEditClick}
            aria-label="Edit profile"
            className="rounded-full p-1.5 text-app-muted transition hover:bg-app-surface hover:text-foreground"
          >
            <Icon icon="lucide:settings" width={20} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}

export default UserProfileBanner;
