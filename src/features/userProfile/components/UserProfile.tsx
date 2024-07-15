import { useUser } from '@/features/authentication/useUser';
import ReviewContainer from '@/features/reviews/components/ReviewContainer';
import VenueListContainer from '@/features/venues/components/VenueListContainer';
import { useGetUserProfile } from '../hooks/useGetUserProfile';
import LoaderSpinner from '@/ui/LoaderSpinner';

function UserProfile() {
  const { user, isLoading: isLoadingUser, fetchStatus } = useUser();
  const { id: userId } = user;
  const { userProfile, isLoading: isLoadingProfile } =
    useGetUserProfile(userId);

  if (fetchStatus == 'fetching' || isLoadingUser || isLoadingProfile) return;
  <LoaderSpinner />;

  const { updatedAt, username, avatarUrl, totalReviews, favouriteVenues } =
    userProfile;

  console.log(user);
  console.log(userId);
  console.log(userProfile);

  return (
    <div>
      <ReviewContainer mode="user" />
      <VenueListContainer mode="user" favouriteVenues={favouriteVenues} />
    </div>
  );
}

export default UserProfile;
