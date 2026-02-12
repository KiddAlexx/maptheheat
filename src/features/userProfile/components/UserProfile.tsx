// Third Party Imports
import { useNavigate, useParams } from 'react-router';

// React imports
import { useState } from 'react';

// Hooks
import { useUser } from '@/features/authentication/hooks/useUser';
import { useGetUserProfile } from '../hooks/useGetUserProfile';

// Assets

// Components
import ReviewContainer from '@/features/reviews/components/ReviewContainer';
import VenueListContainer from '@/features/venues/components/VenueListContainer';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { Tab, Tabs } from '@heroui/react';
import UserProfileBanner from './UserProfileBanner';
import EditProfilePanel from './EditProfilePanel';
import NotificationContainer from './NotificationContainer';

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

  // State for currently active Tab
  const [selected, setSelected] = useState<Key>(section || 'reviews');

  if (isFetching || isPendingUser || isLoadingProfile || !userId)
    return <LoaderSpinner message="Loading profile" />;

  const { favouriteVenues } = userProfile;

  function handleSelectionChange(key: Key) {
    setSelected(key);
    navigate(`/profile/${key}`, { replace: true });
  }

  return (
    <div className="w-full max-w-[70rem]">
      <UserProfileBanner userProfile={userProfile} />

      <Tabs
        aria-label="Profile Sections"
        selectedKey={selected}
        onSelectionChange={handleSelectionChange}
        fullWidth
      >
        <Tab key={'reviews'} title="My Reviews">
          <ReviewContainer mode="user" />
        </Tab>

        <Tab key={'venues'} title="Favourite Venues">
          <VenueListContainer mode="user" favouriteVenues={favouriteVenues} />
        </Tab>
        <Tab key={'notifications'} title="Notifications">
          <NotificationContainer userId={userId} />
        </Tab>
        <Tab key={'edit'} title="Edit Profile">
          <EditProfilePanel />
        </Tab>
      </Tabs>
    </div>
  );
}

export default UserProfile;
