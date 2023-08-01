import { NavLink } from 'react-router-dom';

import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase-config';

import styles from './PageNav.module.css';

function PageNav() {
  async function logOut() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <nav className={styles.nav}>
      <h3>
        <NavLink to="/">LOGO</NavLink>
      </h3>
      <ul>
        <li>
          <NavLink to="/login">Login</NavLink>
        </li>
        <li>
          <button onClick={logOut}>Log Out</button>
        </li>
      </ul>
    </nav>
  );
}

export default PageNav;
