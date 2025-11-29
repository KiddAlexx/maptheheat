import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  useDisclosure,
} from '@heroui/react';

import Hamburger from 'hamburger-react';
import { NavLink } from 'react-router-dom';
import AddVenueButton from './AddVenueButton';
import MainLogo from './MainLogo';

function MobileMenu() {
  const { isOpen, onClose, onOpenChange } = useDisclosure();

  return (
    <>
      {/* Hamburger button */}
      <Hamburger color="#fee9d6" toggled={isOpen} toggle={onOpenChange} />

      {/* isOpen used to skip close animation
      when user clicks Add Venue + not logged in, login modal focus trap fights
      with heroui focus trap ---- temp fix... */}

      {isOpen && (
        <Drawer
          isOpen={isOpen}
          onClose={onClose}
          placement="left"
          radius="none"
          classNames={{
            closeButton: 'text-primary-900 text-2xl bg-primary-50 p-1 m-2',
          }}
        >
          <DrawerContent>
            <DrawerHeader className=" h-16 bg-zinc-700">
              <MainLogo />
            </DrawerHeader>

            {/* Navigation items */}
            <ul className="flex flex-col space-y-4 px-6 py-6 text-lg">
              <li onClick={onClose}>
                <NavLink
                  className="text-2xl font-medium text-primary-950 transition-colors hover:text-primary-300"
                  to="/"
                >
                  Home
                </NavLink>
              </li>
              <li onClick={onClose}>
                <NavLink
                  to="/app/map"
                  className="text-2xl font-medium text-primary-950 transition-colors hover:text-primary-300"
                >
                  Map
                </NavLink>
              </li>
              <li>
                <AddVenueButton
                  closeOtherModals={onClose}
                  className="bg-transparent px-0 text-2xl font-medium text-primary-950 transition-colors hover:text-primary-300"
                />
              </li>
            </ul>

            <DrawerFooter />
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

export default MobileMenu;
