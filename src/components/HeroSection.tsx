// React imports
import { useNavigate } from 'react-router';

// Style imports
import styles from './HeroSection.module.css';
import { Button } from '@nextui-org/react';

function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className={styles.heroSection}>
      <div className={styles.ctaSection}>
        <h1>Uncover the Hottest Spots with MapTheHeat!</h1>
        <p>
          Track down the top places for seriously spicy food. Made for true
          lovers of heat. Start exploring today!
        </p>
        <div className={styles.btnContainer}>
          <Button onClick={() => navigate('app')}>Search Venues</Button>
          <Button onClick={() => navigate('app')}>Search Shops</Button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
