import { NavLink } from 'react-router-dom';
import styles from './PageNav.module.css';
function PageNav() {
  return (
    <nav className={styles.nav}>
      <h3>LOGO</h3>
      <ul>
        <li>
          <NavLink to="/login">Login</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default PageNav;
