// React imports
import { useNavigate } from 'react-router';

// Style imports
import styles from './HeroSection.module.css';

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className={styles.heroSection}>
      <div className={styles.ctaSection}>
        <h1>Feel the Burn: Unleash Explosive Flavors with Map the Heat!</h1>
        <p>
          Navigate to the world's spiciest restaurants and shops. Our platform
          is designed for heat-seekers like you. Start exploring now!
        </p>
        <div className={styles.btnContainer}>
          <button className="btn-default" onClick={() => navigate('app')}>
            Search Restaurants
          </button>
          <button className="btn-default" onClick={() => navigate('app')}>
            Search Shops
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
