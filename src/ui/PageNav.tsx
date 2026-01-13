// React imports
import { NavLink } from 'react-router-dom';

import { Button } from '@heroui/button';
import UserMenu from '@/ui/UserMenu';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useModalContext } from '@/context/ModalContext';
import AddVenueButton from './AddVenueButton';
import MobileMenu from './MobileMenu';
import MainLogo from './MainLogo';

function PageNav() {
  const { isAuthenticated } = useUser();
  const { openModal } = useModalContext();

  return (
    <nav
      aria-label="Main navigation"
      className="flex h-16 items-center justify-between bg-zinc-700 px-4 sm:px-6 "
    >
      {/* Mobile menu */}
      <div className="sm:hidden">
        <MobileMenu />
      </div>
      {/* Desktop menu */}
      <ul className=" flex w-full items-center justify-between">
        <li className="hidden sm:block">
          <NavLink to="/">
            <MainLogo />
          </NavLink>
        </li>
        <li>
          <div className="hidden items-center gap-5 sm:flex">
            <NavLink
              to="/app/map"
              className="text-xl font-medium text-primary-50 transition-colors hover:text-primary-300"
            >
              Map
            </NavLink>
            <AddVenueButton className="h-auto bg-transparent px-0 text-xl font-medium text-primary-50 hover:text-primary-300 data-[hover=true]:bg-transparent" />
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
