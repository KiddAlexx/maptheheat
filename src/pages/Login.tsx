import { auth, googleProvider } from '../config/firebase-config';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { FirebaseError } from '@firebase/util';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');

  const navigate = useNavigate();

  const createAccountWithEmail = async function () {
    try {
      setIsLoadingAuth(true);
      setErrorAuth('');
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
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className={styles.authButtonContainer}>
        <button className="btn-default" onClick={createAccountWithEmail}>
          Create Account
        </button>
        <button className="btn-default" onClick={signInWithEmail}>
          Sign In
        </button>
        <button className="btn-default" onClick={signInWithGoogle}>
          Sign In With Google
        </button>
      </div>
      {errorAuth ?? <p>{errorAuth}</p>}
    </div>
  );
}

export default Login;
