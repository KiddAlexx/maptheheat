import { useUser } from '@/features/authentication/hooks/useUser';
import ReviewContainer from '@/features/reviews/components/ReviewContainer';
import VenueListContainer from '@/features/venues/components/VenueListContainer';
import { useGetUserProfile } from '../hooks/useGetUserProfile';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { Tab, Tabs } from '@heroui/react';
import { useState } from 'react';
import UserProfileBanner from './UserProfileBanner';
import EditProfilePanel from './EditProfilePanel';
import { useNavigate, useParams } from 'react-router';
import { Key } from '@/types/venueTypes';

function UserProfile() {
  const { user, isLoading: isLoadingUser, fetchStatus } = useUser();

  // Extract user id if present and use to fetch userProfile
  const userId = user?.id;
  const { userProfile, isLoading: isLoadingProfile } =
    useGetUserProfile(userId);

  // Get dynamic 'section' route param
  const { section } = useParams();
  const navigate = useNavigate();

  // State for currently active Tab
  const [selected, setSelected] = useState<Key>(section || 'reviews');

  if (fetchStatus == 'fetching' || isLoadingUser || isLoadingProfile) return;
  <LoaderSpinner />;

  const { favouriteVenues } = userProfile;

  function handleSelectionChange(key: Key) {
    setSelected(key);
    navigate(`/profile/${key}`, { replace: true });
  }

  return (
    <div>
      <UserProfileBanner userProfile={userProfile} />

      <Tabs
        aria-label="Options"
        selectedKey={selected}
        onSelectionChange={handleSelectionChange}
      >
        <Tab key={'reviews'} title="My Reviews">
          <ReviewContainer mode="user" />
        </Tab>
        <Tab key={'venues'} title="Favourite Venues">
          <VenueListContainer mode="user" favouriteVenues={favouriteVenues} />
        </Tab>
        <Tab key={'edit'} title="Edit Profile">
          <EditProfilePanel />
        </Tab>
      </Tabs>
    </div>
  );
}

export default UserProfile;
