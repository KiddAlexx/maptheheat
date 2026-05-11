// Hooks imports
import { useGlobalError } from '../context/ErrorContext';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { Icon } from '@iconify/react/dist/iconify.js';
import ActionButton from '@/ui/ActionButton';

// Framer Motion
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit: { opacity: 0, transition: { duration: 0.22, ease: 'easeIn' as const } },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

const panelVariantsReduced = {
  hidden: { opacity: 0, scale: 1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0 } },
  exit: { opacity: 0, scale: 1, transition: { duration: 0 } },
};

interface ErrorModalProps {
  errorMessage?: string | null;
  clearLocalError?: () => void;
}

function ErrorModal({
  errorMessage: localErrorMessage,
  clearLocalError,
}: ErrorModalProps) {
  const { globalErrorMessage, clearGlobalError } = useGlobalError();

  const [modalRoot, setModalRoot] = useState<Element | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setModalRoot(document.querySelector('#modal-root'));
  }, []);

  // Gives option for error message via props or context
  const finalErrorMessage = localErrorMessage || globalErrorMessage;

  // Clears eror message in local file or context
  const handleClearError = localErrorMessage
    ? clearLocalError
    : clearGlobalError;

  // Using the non-null assertion operator (!) on handleClearError.
  // handleClearError will always exist as either provided clearLocalError,
  // or clearGlobalError from GlobalError context which always exists.
  useEffect(() => {
    function handleEscapeKeypress(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClearError!();
    }
    document.addEventListener('keydown', handleEscapeKeypress);
    return () => {
      document.removeEventListener('keydown', handleEscapeKeypress);
    };
  }, [handleClearError]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClearError!();
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleClearError]);

  if (!modalRoot) return null;

  const activePanelVariants = prefersReducedMotion ? panelVariantsReduced : panelVariants;

  return createPortal(
    <AnimatePresence>
      {finalErrorMessage && (
        <motion.div
          className="fixed left-0 top-0 z-[90000] flex h-full w-full  items-center justify-center bg-black/60 p-3"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <FocusTrap focusTrapOptions={{ initialFocus: '#initialErrorFocus' }}>
            <motion.div
              role="alertdialog"
              aria-labelledby="error-title"
              aria-modal="true"
              className="relative flex flex-col items-center justify-center gap-5 rounded-xl bg-app-card p-5 shadow-[0_10px_20px_rgba(0,0,0,0.19),0_6px_6px_rgba(0,0,0,0.23)] sm:flex-row sm:gap-3"
              ref={modalRef}
              variants={activePanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center gap-3">
                <Icon
                  aria-hidden="true"
                  className="shrink-0 text-danger-600"
                  icon="ic:baseline-error"
                  width="40"
                />
                <h2 id="error-title" className="sr-only">
                  Error
                </h2>
                <p className="max-w-md">{finalErrorMessage}</p>
              </div>
              <ActionButton
                intent="confirm"
                id="initialErrorFocus"
                onPress={handleClearError}
                type="button"
              >
                Close
              </ActionButton>
            </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>,
    modalRoot
  );
}

export default ErrorModal;
