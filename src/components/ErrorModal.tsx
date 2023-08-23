import styles from './ErrorModal.module.css';
import { useRestaurants } from '../context/RestaurantContext';

interface ErrorModalProps {
  errorMessage: string;
}

function ErrorModal({ errorMessage }: ErrorModalProps) {
  const { clearError } = useRestaurants();
  return (
    <div className={styles.errorModalBackdrop}>
      <div className={styles.errorModalContent}>
        <p>{errorMessage}</p>
        <button onClick={clearError}>Close</button>
      </div>
    </div>
  );
}

export default ErrorModal;
