// Style imports

// Hooks imports
import { useGlobalError } from '../context/ErrorContext';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';

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

  // Only render if error & modalRoot exist
  if (!finalErrorMessage || !modalRoot) return null;

  return createPortal(
    <div className="fixed left-0 top-0 z-[9000] flex h-full w-full items-center justify-center bg-black/60">
      <FocusTrap focusTrapOptions={{}}>
        <div
          className="relative flex  items-center justify-center gap-3 rounded-xl bg-white p-5 shadow-[0_10px_20px_rgba(0,0,0,0.19),0_6px_6px_rgba(0,0,0,0.23)]"
          ref={modalRef}
        >
          <Icon className="text-red-600" icon="ic:baseline-error" width="40" />
          <p className="max-w-md">{finalErrorMessage}</p>
          <Button onPress={handleClearError}>Close</Button>
        </div>
      </FocusTrap>
    </div>,
    modalRoot
  );
}

export default ErrorModal;
