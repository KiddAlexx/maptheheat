// Style imports
import styles from './AuthForm.module.css';

// Third party imports
import { useForm } from 'react-hook-form';

// File imports
import googleBtnLight from '../../assets/btn_google_light_normal_ios.svg';
import { useEmailSignup } from './useEmailSignup';
import { useGoogleLogin } from './useGoogleLogin';
import LoaderSpinner from '../../ui/LoaderSpinner';

function SignupForm() {
  interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
  }

  const { register, handleSubmit, reset, getValues, formState } =
    useForm<FormData>();
  const { errors } = formState;

  const { signupEmail, isPending: isPendingEmail } = useEmailSignup();
  const { loginGoogle, isPending: isPendingGoogle } = useGoogleLogin();

  function formSubmit(formData: FormData) {
    console.log(formData);
    console.log(formState);
    const { email, password } = formData;
    console.log(email, password);
    if (!email || !password) return;
    signupEmail({ email, password }, { onSettled: () => reset() });
  }
  return isPendingEmail || isPendingGoogle ? (
    <LoaderSpinner />
  ) : (
    <form
      onSubmit={handleSubmit(formSubmit)}
      noValidate
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
        {typeof errors?.email?.message === 'string' && (
          <span> {errors.email.message}</span>
        )}
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
        {typeof errors?.password?.message === 'string' && (
          <span> {errors.password.message}</span>
        )}
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
        {typeof errors?.confirmPassword?.message === 'string' && (
          <span> {errors.confirmPassword.message}</span>
        )}
      </div>

      <div className={styles.authButtonContainer}>
        <button className="btn-default" type="submit">
          Create Account
        </button>
        <button
          type="button"
          className={`btn-default ${styles.btnLoginGoogle}`}
          onClick={() => loginGoogle()}
        >
          <img src={googleBtnLight} alt="Google logo" />
          Sign In With Google
        </button>
      </div>
    </form>
  );
}

export default SignupForm;
