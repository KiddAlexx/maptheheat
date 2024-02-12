// Style imports
import styles from './ErrorModal.module.css';

// Hooks imports
import { useVenues } from '../context/VenueContext';

interface ErrorModalProps {
  errorMessage?: string | null;
  clearLocalError?: () => void;
}

function ErrorModal({
  errorMessage: localErrorMessage,
  clearLocalError,
}: ErrorModalProps) {
  const { errorMessage: contextErrorMessage, clearError } = useVenues();

  // Gives option for error message via props or context
  const finalErrorMessage = localErrorMessage || contextErrorMessage;

  // Clears eror message in local file or context
  const handleClearError = localErrorMessage ? clearLocalError : clearError;

  // Only render if error exist
  if (!finalErrorMessage) return null;

  return (
    <div className={styles.errorModalBackdrop}>
      <div className={styles.errorModalContent}>
        <p>{finalErrorMessage}</p>
        <button onClick={handleClearError}>Close</button>
      </div>
    </div>
  );
}

export default ErrorModal;
