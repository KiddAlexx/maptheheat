// Third Party Imports
import Hamburger from 'hamburger-react';
import { NavLink } from 'react-router-dom';
import FocusTrap from 'focus-trap-react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

// React imports
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Components
import AddVenueButton from './AddVenueButton';
import MainLogo from './MainLogo';

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);
  const pendingCallback = useRef<(() => void) | null>(null);

  // Query #modal-root after mount (matches Modal.tsx pattern)
  useEffect(() => {
    setPortalRoot(document.querySelector('#modal-root'));
  }, []);

  // Body scroll lock while menu is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  function closeAndThen(callback: () => void) {
    pendingCallback.current = callback;
    setIsOpen(false);
  }

  // Shared base styles for every clickable row in the menu.
  const menuItemBase =
    'block w-full px-6 py-3 text-2xl font-medium text-foreground transition-colors hover:bg-app-surface hover:text-primary-400';

  return (
    <>
      <Hamburger color="#fee9d6" toggled={isOpen} toggle={setIsOpen} />

      {portalRoot &&
        createPortal(
          <AnimatePresence
            onExitComplete={() => {
              // Fires after exit animations complete AND React unmounts the children.
              // Safe, race-free moment to open the next modal.
              if (pendingCallback.current) {
                const cb = pendingCallback.current;
                pendingCallback.current = null;
                cb();
              }
            }}
          >
            {isOpen && (
              <>
                <motion.div
                  key="backdrop"
                  className="fixed inset-0 z-[9998] bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />

                <FocusTrap
                  focusTrapOptions={{
                    // Allow backdrop clicks to register and deactivate the trap;
                    // without this, focus-trap-react preventDefaults outside clicks.
                    clickOutsideDeactivates: true,
                    returnFocusOnDeactivate: true,
                  }}
                >
                  <motion.nav
                    key="panel"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation"
                    tabIndex={-1}
                    className="bg-app-card fixed left-0 top-0 z-[9999] flex h-full w-72 flex-col shadow-xl outline-none"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    <div className="border-app-border flex h-16 items-center border-b bg-zinc-950/90 px-4">
                      <MainLogo />
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      aria-label="Close menu"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-2xl leading-none text-primary-100 transition-colors hover:bg-zinc-700"
                    >
                      ×
                    </button>

                    <ul className="flex flex-col py-4 text-lg">
                      <li>
                        <NavLink
                          onClick={() => setIsOpen(false)}
                          to="/"
                          className={menuItemBase}
                        >
                          Home
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          onClick={() => setIsOpen(false)}
                          to="/app/map"
                          className={menuItemBase}
                        >
                          Map
                        </NavLink>
                      </li>
                      <li>
                        <AddVenueButton
                          closeOtherModals={closeAndThen}
                          className={clsx(
                            menuItemBase,
                            'h-auto !flex !justify-start rounded-none bg-transparent'
                          )}
                        />
                      </li>
                    </ul>
                  </motion.nav>
                </FocusTrap>
              </>
            )}
          </AnimatePresence>,
          portalRoot
        )}
    </>
  );
}

export default MobileMenu;
