// React imports
import { NavLink } from 'react-router-dom';

// Style imports
import styles from './PageNav.module.css';
import { useUser } from '../authentication/useUser';
import { useModalContext } from '../../context/ModalContext';
import { Button } from '@nextui-org/button';
import UserMenu from '@/ui/UserMenu';

function PageNav() {
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
              <Button
                color="primary"
                size="lg"
                radius="sm"
                onClick={() => openModal('login')}
              >
                Login / Sign Up
              </Button>
            </li>
          </>
        ) : (
          <li>
            <UserMenu />
            {/*   <button
              onClick={() => logout()}
              className={`btn-default ${styles.btnLogout}`}
            >
              Log Out
            </button> */}
          </li>
        )}
      </ul>
    </nav>
  );
}

export default PageNav;
