import brokenChilli from '../assets/broken-chilli-grey-md.webp';
import { Button, Image } from '@heroui/react';
import { useNavigate } from 'react-router';

function PageNotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex w-full justify-center px-4 pt-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-6 text-center shadow-md sm:p-10">
        <div className="mx-auto mb-8 max-h-[320px] w-full opacity-90 sm:max-h-[380px]">
          <Image
            className="mx-auto h-full w-auto object-contain sm:max-h-[380px]"
            src={brokenChilli}
            removeWrapper
            radius="sm"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-2xl font-semibold text-gray-700 sm:text-3xl">
          Woops, it looks like that page does not exist! 🤔
        </h1>
        <p className="mt-3 text-sm text-gray-500 sm:text-base">
          The page may have been moved, deleted, or the link is incorrect.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button radius="full" variant="flat" color="primary" onPress={() => navigate(-1)}>
            Go back
          </Button>

          <Button radius="full"
            className="bg-success-400"
            onPress={() => navigate('/app/map')}
          >
            Go to map
          </Button>
        </div>
      </div>
    </main>
  );
}

export default PageNotFound;
