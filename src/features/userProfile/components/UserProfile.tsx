import { useUser } from '@/features/authentication/useUser';
import ReviewContainer from '@/features/reviews/components/ReviewContainer';
import VenueListContainer from '@/features/venues/components/VenueListContainer';
import { useGetUserProfile } from '../hooks/useGetUserProfile';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { Tab, Tabs } from '@nextui-org/react';
import { useState } from 'react';
import UserProfileBanner from './UserProfileBanner';

function UserProfile() {
  const { user, isLoading: isLoadingUser, fetchStatus } = useUser();
  const { id: userId } = user;
  const { userProfile, isLoading: isLoadingProfile } =
    useGetUserProfile(userId);
  const [selected, setSelected] = useState('reviews');

  if (fetchStatus == 'fetching' || isLoadingUser || isLoadingProfile) return;
  <LoaderSpinner />;

  const { updatedAt, username, avatarUrl, totalReviews, favouriteVenues } =
    userProfile;

  return (
    <div>
      <UserProfileBanner userProfile={userProfile} />
      <Tabs
        aria-label="Options"
        selectedKey={selected}
        onSelectionChange={setSelected}
      >
        <Tab key={'reviews'} title="My Reviews">
          <ReviewContainer mode="user" />
        </Tab>
        <Tab key={'venues'} title="Favourite Venues">
          <VenueListContainer mode="user" favouriteVenues={favouriteVenues} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default UserProfile;
