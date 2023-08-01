import { auth, googleProvider } from '../config/firebase-config';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { FirebaseError } from '@firebase/util';
import { useState } from 'react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [errorAuth, setErrorAuth] = useState('');
  console.log(auth?.currentUser?.email);

  const createAccountWithEmail = async function () {
    try {
      setIsLoadingAuth(true);
      setErrorAuth('');
      await createUserWithEmailAndPassword(auth, email, password);
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
    } catch (err) {
      const firebaseError = err as FirebaseError;
      setErrorAuth(firebaseError.message);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <div>
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={createAccountWithEmail}>Create Account</button>
      <button onClick={signInWithEmail}>Sign In</button>
      <button onClick={signInWithGoogle}>Sign In With Google</button>
      {errorAuth ?? <p>{errorAuth}</p>}
    </div>
  );
}

export default Login;
