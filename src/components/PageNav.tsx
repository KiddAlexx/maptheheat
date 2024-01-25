// React imports
import { NavLink, useNavigate } from 'react-router-dom';

// Firebase imports
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase-config';

// Style imports
import styles from './PageNav.module.css';
import { useUser } from '../features/authentication/useUser';

function PageNav() {
  const navigate = useNavigate();

  // Sign out from firebase and navigate to homepage
  async function logOut() {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  }

  const { isAuthenticated } = useUser();

  return (
    <nav className={styles.nav}>
      <h3 className={styles.logoMain}>
        <NavLink to="/">Map The Heat</NavLink>
      </h3>
      <ul className={styles.authButtons}>
        {/* Checks user login state
            Displays Login & Signup or Logout button */}
        {!isAuthenticated ? (
          <>
            <li>
              <NavLink to="/login" className={`btn-default ${styles.btnLogin}`}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/signup"
                className={`btn-default ${styles.btnLogin}`}
              >
                Sign Up!
              </NavLink>
            </li>
          </>
        ) : (
          <li>
            <button
              onClick={logOut}
              className={`btn-default ${styles.btnLogout}`}
            >
              Log Out
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default PageNav;
