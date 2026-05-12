// Third Party Imports
import Hamburger from 'hamburger-react';
import { NavLink } from 'react-router-dom';

// React imports
import { useRef } from 'react';

// Components
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  useDisclosure,
} from '@heroui/react';
import AddVenueButton from './AddVenueButton';
import MainLogo from './MainLogo';

function MobileMenu() {
  const { isOpen, onClose, onOpenChange } = useDisclosure();
  const pendingCallback = useRef<(() => void) | null>(null);

  function closeAndThen(callback: () => void) {
    pendingCallback.current = callback;
    onClose();
  }

  return (
    <>
      {/* Hamburger button */}
      <Hamburger color="#fee9d6" toggled={isOpen} toggle={onOpenChange} />

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
        radius="none"
        classNames={{
          closeButton:
            'text-primary-100 text-2xl bg-zinc-950/90 p-1 m-2 hover:bg-zinc-800',
          wrapper: 'z-[9999]',
        }}
        motionProps={{
          // HeroUI replaces its placement variants entirely when motionProps is set,
          // so the left-slide variants must be included here explicitly.
          variants: {
            enter: {
              x: 0,
              transition: { x: { duration: 0.2, ease: 'easeOut' } },
            },
            exit: {
              x: '-100%',
              transition: { x: { duration: 0.1, ease: 'easeIn' } },
            },
          },
          onAnimationComplete: (definition) => {
            // Fires after the exit animation fully completes — safe point to open
            // a new modal without competing with the Drawer's overlay cleanup.
            if (definition === 'exit' && pendingCallback.current) {
              const cb = pendingCallback.current;
              pendingCallback.current = null;
              cb();
            }
          },
        }}
      >
        <DrawerContent>
          <DrawerHeader className="border-app-border h-16 border-b bg-zinc-950/90">
            <MainLogo />
          </DrawerHeader>

          {/* Navigation items */}
          <ul className="flex flex-col space-y-4 px-6 py-6 text-lg">
            <li onClick={onClose}>
              <NavLink
                className="text-2xl font-medium text-foreground transition-colors hover:text-primary-400"
                to="/"
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                onClick={onClose}
                to="/app/map"
                className="text-2xl font-medium text-foreground transition-colors hover:text-primary-400"
              >
                Map
              </NavLink>
            </li>
            <li>
              <AddVenueButton
                closeOtherModals={closeAndThen}
                className="bg-transparent px-0 text-2xl font-medium text-foreground transition-colors hover:text-primary-400"
              />
            </li>
          </ul>

          <DrawerFooter />
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default MobileMenu;
