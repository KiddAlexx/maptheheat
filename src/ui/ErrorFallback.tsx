import { FallbackProps } from 'react-error-boundary';
import brokenChilli from '../assets/broken-chilli-grey-md.webp';
import { Button, Image } from '@heroui/react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
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
          Oops — something went wrong 😫
        </h1>

        <p className="mt-3 text-sm text-gray-500 sm:text-base">
          Try again, or head back to the map.
        </p>

        <details className="mx-auto mt-6 max-w-xl text-left">
          <summary className="cursor-pointer text-sm font-medium text-gray-600">
            Technical details
          </summary>
          <pre className="mt-3 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
            {message}
          </pre>
        </details>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="flat"
            color="primary"
            onPress={() => {
              resetErrorBoundary();
              window.location.assign('/');
            }}
          >
            Try again
          </Button>

          <Button
            className="bg-success-400"
            onPress={() => {
              resetErrorBoundary();
              window.location.assign('/app/map');
            }}
          >
            Go to map
          </Button>
        </div>
      </div>
    </main>
  );
}

export default ErrorFallback;
