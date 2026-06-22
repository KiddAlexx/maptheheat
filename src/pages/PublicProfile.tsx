import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';

import { useGetPublicProfile } from '@/features/userProfile/hooks/useGetPublicProfile';
import { PageSeo } from '@/lib/seo';
import LoaderSpinner from '@/ui/LoaderSpinner';

import PageNotFound from './PageNotFound';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const notFoundPage = (
  <>
    <Helmet>
      <title>Profile Not Found | MapTheHeat</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <PageNotFound />
  </>
);

function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const isValidId = !!userId && UUID_REGEX.test(userId);

  const { isLoading, publicProfile } = useGetPublicProfile(
    isValidId ? userId : null
  );

  if (!isValidId) return notFoundPage;
  if (isLoading) return <LoaderSpinner message="Loading profile" />;
  if (!publicProfile) return notFoundPage;

  return (
    <main className="flex justify-center p-4 sm:p-6 md:p-10">
      <PageSeo
        title={`${publicProfile.username ?? 'User'}'s Profile | MapTheHeat`}
        description={`View ${publicProfile.username ?? 'this user'}'s contributions on MapTheHeat.`}
      />
      <h1 className="sr-only">{publicProfile.username ?? 'User'}'s Profile</h1>
      <div className="w-full max-w-[70rem]" />
    </main>
  );
}

export default PublicProfile;
