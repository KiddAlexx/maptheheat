// Third Party Imports
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';

// React imports

// Hooks
import { useUser } from '@/features/authentication/hooks/useUser';
import { useModalContext } from '@/context/ModalContext';

// Assets
import MainLogo from './MainLogo';

// Components
import { Button } from '@heroui/button';
import UserMenu from '@/ui/UserMenu';
import AddVenueButton from './AddVenueButton';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';

// Style imports
import styles from './MainLogo.module.css';

function PageNav() {
  const { isAuthenticated } = useUser();
  const { openModal } = useModalContext();
  const { pathname } = useLocation();
  const { city, country } = useParams();
  const [searchParams] = useSearchParams();
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const isAdminRoute = pathname.startsWith('/admin');

  const mapHref =
    city && country && lat && lon
      ? `/app/map/${city}/${country}?lat=${lat}&lon=${lon}`
      : '/app/map';

  return (
    <nav
      aria-label="Main navigation"
      className="flex h-16 items-center justify-between border-b border-app-border bg-zinc-950/90 px-4 sm:px-8"
    >
      {/* Left: hamburger (mobile) / logo + links (desktop) */}
      <div className="flex items-center gap-5">
        <div className="sm:hidden">
          <MobileMenu />
        </div>
        <div className="hidden sm:block">
          <Link to="/" className={styles.logoWrap} aria-label="Home">
            <MainLogo variant={isAdminRoute ? 'admin' : 'public'} />
          </Link>
        </div>
        <div className="hidden items-center gap-5 sm:flex">
          <Link
            to={mapHref}
            className="rounded-xl p-1 text-xl font-medium text-primary-50 transition-colors hover:text-primary-300"
          >
            Map
          </Link>
          <AddVenueButton className="h-auto bg-transparent p-1 px-0 text-xl font-medium text-primary-50 hover:text-primary-300 data-[hover=true]:bg-transparent" />
        </div>
      </div>

      {/* Center: logo visible on mobile — non-interactive to avoid misclicks */}
      <div className="flex flex-1 justify-center sm:hidden">
        <span className={styles.logoWrap} aria-hidden="true">
          <MainLogo variant={isAdminRoute ? 'admin' : 'public'} />
        </span>
      </div>

      {/* Right: theme toggle + auth */}
      <div className="flex gap-2">
        <ThemeToggle />
        {!isAuthenticated ? (
          <Button
            size="sm"
            radius="full"
            onPress={() => openModal('login')}
            className="h-9 min-w-28 bg-success-300 text-sm font-medium text-success-foreground"
          >
            Sign In
          </Button>
        ) : (
          <div className="flex items-center">
            <UserMenu />
          </div>
        )}
      </div>
    </nav>
  );
}

export default PageNav;
