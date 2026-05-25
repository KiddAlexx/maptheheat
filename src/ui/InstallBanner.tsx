import { Icon } from '@iconify/react/dist/iconify.js';
import { Button } from '@heroui/react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export default function InstallBanner() {
  const { canInstall, triggerInstall, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div
      role="complementary"
      aria-label="Install app prompt"
      className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-2.5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <img
          src="/icon-192.png"
          alt=""
          aria-hidden="true"
          className="h-10 w-10 shrink-0 rounded-xl"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary-50">
            Install MapTheHeat
          </p>
          <p className="hidden text-xs text-zinc-400 sm:block">
            Discover spicy spots — right from your home screen
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          size="sm"
          radius="full"
          onPress={triggerInstall}
          className="bg-success-300 text-xs font-medium text-success-foreground"
        >
          Install
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="p-1 text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <Icon icon="lucide:x" width={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
