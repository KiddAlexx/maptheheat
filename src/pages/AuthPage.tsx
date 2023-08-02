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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.pathname.includes('signup') ? 'signup' : 'login';

  console.log(auth);

  const resetAuthState = function () {
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setIsLoadingAuth(false);
  };

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
      resetAuthState();
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
      resetAuthState();
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
      resetAuthState();
    }
  };

  return (
    <form className={styles.authContainer} onSubmit={handleSubmit}>
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
            <button className="btn-default" onClick={signInWithGoogle}>
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
  );
}

export default Login;
