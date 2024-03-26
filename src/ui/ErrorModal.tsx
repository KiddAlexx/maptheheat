// Style imports
import styles from './ErrorModal.module.css';

// Hooks imports
import { useGlobalError } from '../context/ErrorContext';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FocusTrap from 'focus-trap-react';

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
    <div className={styles.errorModalBackdrop}>
      <FocusTrap focusTrapOptions={{}}>
        <div className={styles.errorModalContent} ref={modalRef}>
          <p>{finalErrorMessage}</p>
          <button onClick={handleClearError}>Close</button>
        </div>
      </FocusTrap>
    </div>,
    modalRoot
  );
}

export default ErrorModal;
