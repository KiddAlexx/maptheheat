// React imports
import { NavLink } from 'react-router-dom';

// Style imports
import styles from './PageNav.module.css';
import { useUser } from '../authentication/useUser';
import { useLogout } from '../authentication/useLogout';
import { useModalContext } from '../../context/ModalContext';

function PageNav() {
  const { logout } = useLogout();

  const { isAuthenticated } = useUser();
  const { openModal } = useModalContext();

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
              <button
                onClick={() => openModal('login')}
                className={`btn-default ${styles.btnLogin}`}
              >
                Login / Sign Up
              </button>
            </li>
          </>
        ) : (
          <li>
            <button
              onClick={() => logout()}
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
