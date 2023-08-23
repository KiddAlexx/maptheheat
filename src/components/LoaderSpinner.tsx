import { ColorRing } from 'react-loader-spinner';
import styles from './LoaderSpinner.module.css';

function LoaderSpinner() {
  return (
    <div className={styles.loaderSpinnerContainer}>
      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="blocks-loading"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
        colors={['#2b6027', '#53b84c', '#d46326', '#fd7350', '#f18d74']}
      />
    </div>
  );
}

export default LoaderSpinner;
