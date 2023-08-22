import styles from './PageNotFound.module.css';
import brokenChilli from '../assets/broken-chilli-grey-md.png';

function PageNotFound() {
  return (
    <div className={styles.pageContainer}>
      <img
        className={styles.brokenChilliImg}
        src={brokenChilli}
        alt="grey image of a broken chilli pepper"
      />
      <h1>Woops, it looks like that page does not exist!🤔</h1>
    </div>
  );
}

export default PageNotFound;
