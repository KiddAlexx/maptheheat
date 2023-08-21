import { auth, googleProvider } from '../config/firebase-config';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { FirebaseError } from '@firebase/util';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';

import styles from './Login.module.css';
import googleBtnLight from '../assets/btn_google_light_normal_ios.svg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.pathname.includes('signup') ? 'signup' : 'login';

  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === 'login') {
      await signInWithEmail();
    }
    if (mode === 'signup') {
      await createAccountWithEmail();
    }
  };

  const createAccountWithEmail = async function () {
    try {
      setIsLoadingAuth(true);
      setErrorAuth('');
      if (password !== confirmPassword) {
        setErrorAuth('Woops, the passwords do not match!');
        setPassword('');
        setConfirmPassword('');
        return;
      }
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setErrorAuth(firebaseError.message);
    } finally {
      setIsLoadingAuth(false);
    }
  };
  const signInWithEmail = async function () {
    try {
      setIsLoadingAuth(true);
      setErrorAuth('');
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setErrorAuth(firebaseError.message);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signInWithGoogle = async function () {
    try {
      setIsLoadingAuth(true);
      setErrorAuth('');
      await signInWithPopup(auth, googleProvider);
      navigate('/app');
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setErrorAuth(firebaseError.message);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authFormContainer} onSubmit={handleSubmit}>
        <input
          placeholder="Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password..."
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === 'signup' && (
          <input
            placeholder="Confirm Password..."
            value={confirmPassword}
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}
        <div className={styles.authButtonContainer}>
          {mode === 'login' ? (
            <>
              <button className="btn-default" type="submit">
                Sign In
              </button>
              <div className={styles.divider}>
                <p>OR</p>
              </div>

              <button
                className={`btn-default ${styles.btnLoginGoogle}`}
                onClick={signInWithGoogle}
              >
                <img src={googleBtnLight} alt="Google logo" />
                Sign In With Google
              </button>
            </>
          ) : (
            <button className="btn-default" type="submit">
              Create Account
            </button>
          )}
        </div>
        {errorAuth ?? <p>{errorAuth}</p>}
      </form>
    </div>
  );
}

export default Login;
