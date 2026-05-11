import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full p-2 text-primary-50 transition-colors hover:text-primary-300"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Icon
        icon={isDark ? 'lucide:sun' : 'lucide:moon'}
        width={20}
        aria-hidden="true"
      />
    </button>
  );
}

export default ThemeToggle;
