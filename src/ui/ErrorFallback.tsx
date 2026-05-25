import { FallbackProps } from 'react-error-boundary';
import brokenChilli from '../assets/broken-chilli-grey-md.webp';
import { Button, Image } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  const [copied, setCopied] = useState(false);

  async function copyError() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <main className="flex w-full justify-center px-4 pt-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl rounded-xl border border-app-border bg-app-card p-6 text-center shadow-md sm:p-10">
        <div className="mx-auto mb-8 max-h-[320px] w-full opacity-90 sm:max-h-[380px]">
          <Image
            className="mx-auto h-full w-auto object-contain sm:max-h-[380px]"
            src={brokenChilli}
            removeWrapper
            radius="sm"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Oops — something went wrong 😫
        </h1>

        <p className="mt-3 text-sm text-app-muted sm:text-base">
          Try again, or head back to the map.
        </p>

        <details className="mx-auto mt-6 max-w-xl text-left">
          <summary className="cursor-pointer text-sm font-medium text-app-muted">
            Technical details
          </summary>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs text-app-muted">Copy this and paste it into the contact form.</p>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              aria-label="Copy error details"
              title={copied ? 'Copied!' : 'Copy error details'}
              onPress={copyError}
            >
              <Icon aria-hidden="true" icon={copied ? 'lucide:check' : 'lucide:copy'} width={16} />
            </Button>
          </div>
          <pre className="mt-2 overflow-auto rounded-lg bg-gray-100 p-3 text-xs text-foreground dark:bg-zinc-800">
            {message}
          </pre>
        </details>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button radius="full"
            variant="flat"
            color="primary"
            onPress={() => {
              resetErrorBoundary();
              window.location.assign('/');
            }}
          >
            Try again
          </Button>

          <Button radius="full"
            className="bg-success-400 text-success-foreground"
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
