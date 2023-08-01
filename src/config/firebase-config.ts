import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAKhe05QKeOgRi6vjxwIM6p5b5YoDeYw0c',
  authDomain: 'maptheheat.firebaseapp.com',
  projectId: 'maptheheat',
  storageBucket: 'maptheheat.appspot.com',
  messagingSenderId: '450743103808',
  appId: '1:450743103808:web:438724886bff601b588aa5',
  measurementId: 'G-GD5CWT0LJM',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
