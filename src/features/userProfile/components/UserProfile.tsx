// Third Party Imports
import { useNavigate, useParams } from 'react-router';

// React imports
import { lazy, Suspense } from 'react';

// Hooks
import { useUser } from '@/features/authentication/hooks/useUser';
import { useGetUserProfile } from '../hooks/useGetUserProfile';
import { useGetMyFavourites } from '../hooks/useGetMyFavourites';

// Assets

// Components
import { Icon } from '@iconify/react';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { Tab, Tabs } from '@heroui/react';
import UserProfileBanner from './UserProfileBanner';
import EditProfilePanel from './EditProfilePanel';

const ReviewContainer = lazy(
  () => import('@/features/reviews/components/ReviewContainer')
);
const VenueListContainer = lazy(
  () => import('@/features/venues/components/VenueListContainer')
);
const NotificationContainer = lazy(() => import('./NotificationContainer'));

// Type imports
import type { Key } from '@/types/venueTypes';

function UserProfile() {
  const { user, isPending: isPendingUser, isFetching } = useUser();

  // Extract user id if present and use to fetch userProfile
  const userId = user?.id;
  const { userProfile, isLoading: isLoadingProfile } =
    useGetUserProfile(userId);

  // Get dynamic 'section' route param
  const { section } = useParams();
  const navigate = useNavigate();

  const selected = (section || 'reviews') as Key;

  const { myFavourites: favouriteVenues, isLoading: isLoadingFavourites } =
    useGetMyFavourites(userId);

  if (isFetching || isPendingUser || isLoadingProfile || isLoadingFavourites || !userId || !userProfile)
    return <LoaderSpinner message="Loading profile" />;

  function handleSelectionChange(key: Key) {
    navigate(`/profile/${key}`, { replace: true });
  }

  return (
    <div className="w-full max-w-[70rem]">
      <UserProfileBanner
        userProfile={userProfile}
        onEditClick={() => handleSelectionChange('edit')}
      />

      <Tabs
        aria-label="Profile Sections"
        selectedKey={selected}
        onSelectionChange={handleSelectionChange}
        fullWidth
        radius="full"
      >
        <Tab
          key="reviews"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:star" width={15} aria-hidden="true" />
              <span className="mt-px">Reviews</span>
            </div>
          }
        >
          <Suspense fallback={<LoaderSpinner />}>
            <ReviewContainer mode="user" />
          </Suspense>
        </Tab>

        <Tab
          key="venues"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:heart" width={15} aria-hidden="true" />
              <span className="mt-px">Favourites</span>
            </div>
          }
        >
          <Suspense fallback={<LoaderSpinner />}>
            <VenueListContainer mode="user" favouriteVenues={favouriteVenues} />
          </Suspense>
        </Tab>

        <Tab
          key="notifications"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:bell" width={15} aria-hidden="true" />
              <span className="mt-px">Notifications</span>
            </div>
          }
        >
          <Suspense fallback={<LoaderSpinner />}>
            <NotificationContainer userId={userId} />
          </Suspense>
        </Tab>

        <Tab
          key="edit"
          title={
            <div className="flex items-center gap-1.5">
              <Icon icon="lucide:settings" width={15} aria-hidden="true" />
              <span className="mt-px">Edit Profile</span>
            </div>
          }
        >
          <EditProfilePanel />
        </Tab>
      </Tabs>
    </div>
  );
}

export default UserProfile;
