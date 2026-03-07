// Third Party Imports
import { NavLink, useParams, useSearchParams } from 'react-router-dom';

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

// Style imports
import styles from './MainLogo.module.css';

function PageNav() {
  const { isAuthenticated } = useUser();
  const { openModal } = useModalContext();
  const { city, country } = useParams();
  const [searchParams] = useSearchParams();
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  const mapHref =
    city && country && lat && lon
      ? `/app/map/${city}/${country}?&lat=${lat}&lon=${lon}`
      : '/app/map';

  return (
    <nav
      aria-label="Main navigation"
      className="flex h-16 items-center justify-between bg-slate-950/80 px-4 sm:px-8 "
    >
      {/* Mobile menu */}
      <div className="sm:hidden">
        <MobileMenu />
      </div>
      {/* Desktop menu */}
      <ul className=" flex w-full items-center justify-between">
        <li className="hidden sm:block">
          <NavLink
            to="/"
            className={styles.logoWrap}
            aria-label="Go to home page"
          >
            <MainLogo />
          </NavLink>
        </li>
        <li>
          <div className="hidden items-center gap-5 sm:flex">
            <NavLink
              to={mapHref}
              className="rounded-xl p-1 text-xl font-medium text-primary-50 transition-colors hover:text-primary-300"
            >
              Map
            </NavLink>
            <AddVenueButton className="h-auto bg-transparent p-1 px-0 text-xl font-medium text-primary-50 hover:text-primary-300 data-[hover=true]:bg-transparent" />
          </div>
        </li>

        {/* Checks user login state
            Displays Login & Signup or Logout button */}
        {!isAuthenticated ? (
          <li>
            <Button
              size="sm"
              onPress={() => openModal('login')}
              className="h-9 min-w-28 bg-success-300 text-sm font-medium text-success-foreground"
            >
              Sign In
            </Button>
          </li>
        ) : (
          <li className="flex items-center">
            <UserMenu />
          </li>
        )}
      </ul>
    </nav>
  );
}

export default PageNav;
