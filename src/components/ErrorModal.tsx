import styles from './ErrorModal.module.css';
import { useRestaurants } from '../context/RestaurantContext';

interface ErrorModalProps {
  errorMessage?: string | null;
  clearLocalError?: () => void;
}

function ErrorModal({
  errorMessage: localErrorMessage,
  clearLocalError,
}: ErrorModalProps) {
  const { errorMessage: contextErrorMessage, clearError } = useRestaurants();

  // Gives option for error message via props or context
  const finalErrorMessage = localErrorMessage || contextErrorMessage;

  const handleClearError = localErrorMessage ? clearLocalError : clearError;

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
