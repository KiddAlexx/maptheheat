// React imports

// Third party imports

// Style imports
import styles from './AuthPage.module.css';

// File imports

// Component imports

import LoginForm from '../features/authentication/LoginForm';
import SignupForm from '../features/authentication/SignupForm';

function AuthPage({ formType }) {
  return (
    <div className={styles.authContainer}>
      {formType === 'login' && <LoginForm />}
      {formType === 'signup' && <SignupForm />}
    </div>
  );
}

export default AuthPage;
