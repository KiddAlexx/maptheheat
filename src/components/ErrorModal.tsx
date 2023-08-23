import styles from './ErrorModal.module.css';
import { useRestaurants } from '../context/RestaurantContext';

interface ErrorModalProps {
  errorMessage?: string;
}

function ErrorModal({ errorMessage: localErrorMessage }: ErrorModalProps) {
  const { errorMessage: contextErrorMessage, clearError } = useRestaurants();

  // Gives option for error message via props or context
  const finalErrorMessage = localErrorMessage || contextErrorMessage;

  if (!finalErrorMessage) return null;

  return (
    <div className={styles.errorModalBackdrop}>
      <div className={styles.errorModalContent}>
        <p>{finalErrorMessage}</p>
        <button onClick={clearError}>Close</button>
      </div>
    </div>
  );
}

export default ErrorModal;
