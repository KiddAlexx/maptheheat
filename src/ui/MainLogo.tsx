import styles from './MainLogo.module.css';

interface MainLogoProps {
  variant?: 'public' | 'admin';
}

function MainLogo({ variant = 'public' }: MainLogoProps) {
  return (
    <span className={styles.logoMain}>
      MapTheHeat
      {variant === 'admin' && (
        <span className="ml-2 align-middle text-base font-semibold uppercase tracking-normal text-primary-100 [-webkit-text-fill-color:currentColor]">
          Admin
        </span>
      )}
    </span>
  );
}

export default MainLogo;
