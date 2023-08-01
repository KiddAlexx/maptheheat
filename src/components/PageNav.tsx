import { NavLink, useNavigate } from 'react-router-dom';

import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase-config';

import styles from './PageNav.module.css';

function PageNav() {
  const navigate = useNavigate();

  async function logOut() {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <nav className={styles.nav}>
      <h3>
        <NavLink to="/">LOGO</NavLink>
      </h3>
      <ul className={styles.authButtons}>
        <li>
          <NavLink to="/login" className={`btn-default ${styles.btnLogin}`}>
            Login
          </NavLink>
        </li>
        <li>
          <button
            onClick={logOut}
            className={`btn-default ${styles.btnLogout}`}
          >
            Log Out
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default PageNav;
