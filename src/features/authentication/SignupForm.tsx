// Style imports
import styles from './AuthForm.module.css';

// Third party imports
import { useForm } from 'react-hook-form';

// File imports
import googleBtnLight from '../../assets/btn_google_light_normal_ios.svg';
import { useEmailSignup } from './useEmailSignup';

function SignupForm() {
  const { register, handleSubmit, reset, getValues } = useForm();

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
          {...register('email', {
            required: 'This field is required',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Please provide a valid email address',
            },
          })}
        />
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Password..."
          {...register('password', {
            required: 'This field is required',
            minLength: {
              value: 8,
              message: 'Password needs a minimum of 8 characters',
            },
            pattern: {
              value:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
              message:
                'Password must contain at least one uppercase, one lowercase, one number and one special character',
            },
          })}
        />
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm Password..."
          {...register('confirmPassword', {
            required: 'This field is required',
            validate: (value) =>
              value === getValues().password || 'Passwords need to match',
          })}
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
