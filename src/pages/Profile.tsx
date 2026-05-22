import UserProfile from '@/features/userProfile/components/UserProfile';
import { PageSeo } from '@/lib/seo';

function Profile() {
  return (
    <main className="flex justify-center p-4 sm:p-6 md:p-10">
      <PageSeo
        title="My Profile | MapTheHeat"
        description="Manage your MapTheHeat profile — update your username, track your submitted venues and reviews, manage saved venues, and adjust account settings."
      />
      <h1 className="sr-only">My Profile</h1>
      <UserProfile />
    </main>
  );
}

export default Profile;
