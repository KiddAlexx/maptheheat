// Style imports
import styles from './AuthForm.module.css';

// File imports
import googleBtnLight from '../../assets/btn_google_light_normal_ios.svg';

function SignupForm() {
  return (
    <form className={styles.authFormContainer}>
      <div className={styles.inputContainer}>
        <label htmlFor="email">Email</label>
        <input placeholder="Email..." id="email" />
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="password">Password</label>
        <input placeholder="Password..." id="password" type="password" />
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="confirm-password">Confirm Password</label>
        <input
          placeholder="Confirm Password..."
          id="confirm-password"
          type="password"
        />
      </div>

      <div className={styles.authButtonContainer}>
        <button className="btn-default" type="submit">
          Create Account
        </button>
        <button
          type="button"
          className={`btn-default ${styles.btnLoginGoogle}`}
        >
          <img src={googleBtnLight} alt="Google logo" />
          Sign In With Google
        </button>
      </div>
    </form>
  );
}

export default SignupForm;
