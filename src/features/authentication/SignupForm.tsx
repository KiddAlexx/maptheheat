// Style imports
import styles from './AuthForm.module.css';

// Third party imports
import { useForm } from 'react-hook-form';

// File imports
import googleBtnLight from '../../assets/btn_google_light_normal_ios.svg';
import { useEmailSignup } from './useEmailSignup';

function SignupForm() {
  const { register, handleSubmit, reset } = useForm();

  const { signupEmail, isLoading } = useEmailSignup();

  function formSubmit(formData) {
    const { email, password } = formData;
    console.log(email, password);
    if (!email || !password) return;
    signupEmail({ email, password }, { onSettled: () => reset() });
  }
  return (
    <form
      onSubmit={handleSubmit(formSubmit)}
      className={styles.authFormContainer}
    >
      <div className={styles.inputContainer}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Email..."
          {...register('email')}
        />
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Password..."
          {...register('password')}
        />
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm Password..."
          {...register('confirmPassword')}
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
