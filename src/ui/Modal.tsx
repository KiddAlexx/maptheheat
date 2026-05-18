// Third Party Imports
import FocusTrap from 'focus-trap-react';

// React imports
import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Framer Motion
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Hooks
import { useModalContext } from '../context/ModalContext';
import { useGlobalError } from '@/context/ErrorContext';

// Assets
import { Icon } from '@iconify/react/dist/iconify.js';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
  exit: { opacity: 0, transition: { duration: 0.22, ease: 'easeIn' as const } },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.15, ease: 'easeIn' as const },
  },
};

const panelVariantsReduced = {
  hidden: { opacity: 0, scale: 1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0 } },
  exit: { opacity: 0, scale: 1, transition: { duration: 0 } },
};

interface ModalProps {
  children: ReactNode;
}

function Modal({ children }: ModalProps) {
  const { closeModal, modalOpen } = useModalContext();
  const { globalErrorMessage } = useGlobalError();
  const [modalRoot, setModalRoot] = useState<Element | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setModalRoot(document.querySelector('#modal-root'));
  }, []);

  useEffect(() => {
    function handleEscapeKeypress(e: KeyboardEvent) {
      if (e.key === 'Escape' && !globalErrorMessage) closeModal();
    }
    document.addEventListener('keydown', handleEscapeKeypress);
    return () => {
      document.removeEventListener('keydown', handleEscapeKeypress);
    };
  }, [closeModal, globalErrorMessage]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        modalRef.current &&
        !globalErrorMessage &&
        !modalRef.current.contains(e.target as Node)
      ) {
        closeModal();
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [closeModal, globalErrorMessage]);

  if (!modalRoot) return null;

  const activePanelVariants = prefersReducedMotion
    ? panelVariantsReduced
    : panelVariants;

  return createPortal(
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          className="fixed left-0 top-0 z-[2000] flex h-full w-full items-center justify-center bg-black/60"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <FocusTrap
            focusTrapOptions={{
              initialFocus: '#firstElementToFocus',
            }}
          >
            <motion.div
              className="bg-app-card relative flex max-h-[90dvh] max-w-[90dvw] items-center justify-center gap-5 rounded-xl p-5 shadow-[0_10px_20px_rgba(0,0,0,0.19),0_6px_6px_rgba(0,0,0,0.23)]"
              ref={modalRef}
              variants={activePanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => closeModal()}
                className="absolute right-2 top-2 z-[2100]"
                aria-labelledby="closeModalLabel"
              >
                <span id="closeModalLabel" className="sr-only">
                  Close modal
                </span>
                <Icon
                  aria-hidden="true"
                  icon="material-symbols:cancel-rounded"
                  width="26"
                />
              </button>
              {children}
            </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>,
    modalRoot
  );
}

export default Modal;
