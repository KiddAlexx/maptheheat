// React imports
import { NavLink } from 'react-router-dom';

// Style imports
import styles from './PageNav.module.css';

import { Button } from '@heroui/button';
import UserMenu from '@/ui/UserMenu';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useModalContext } from '@/context/ModalContext';
import AddVenueButton from './AddVenueButton';
import MapButton from './MapButton';

function PageNav() {
  const { isAuthenticated } = useUser();
  const { openModal } = useModalContext();

  return (
    <nav
      aria-label="Main navigation"
      className="flex h-16 items-center justify-between bg-zinc-700 px-8 "
    >
      <ul className="flex w-full items-center justify-between">
        <li className={styles.logoMain}>
          <NavLink to="/">MapTheHeat</NavLink>
        </li>
        <li>
          <div className="flex items-center gap-5">
            <MapButton />
            <AddVenueButton />
          </div>
        </li>

        {/* Checks user login state
            Displays Login & Signup or Logout button */}
        {!isAuthenticated ? (
          <li>
            <Button
              size="sm"
              onPress={() => openModal('login')}
              className="h-9 min-w-32 bg-success-300 text-base font-medium text-success-foreground "
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
