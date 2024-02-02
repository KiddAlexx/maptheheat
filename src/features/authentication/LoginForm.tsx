// Style imports
import styles from './AuthForm.module.css';

// File imports
import googleBtnLight from '../../assets/btn_google_light_normal_ios.svg';
import { useForm } from 'react-hook-form';
import { useEmailLogin } from './useEmailLogin';
import { useGoogleLogin } from './useGoogleLogin';
import LoaderSpinner from '../../ui/LoaderSpinner';

function LoginForm() {
  interface FormData {
    email: string;
    password: string;
  }

  const { register, handleSubmit, reset, formState } = useForm<FormData>();
  const { errors } = formState;

  const { loginEmail, isPending: isPendingEmail } = useEmailLogin();
  const { loginGoogle, isPending: isPendingGoogle } = useGoogleLogin();

  function formSubmit(formData: FormData) {
    console.log(formData);
    console.log(formState);
    const { email, password } = formData;
    console.log(email, password);
    if (!email || !password) return;
    loginEmail(
      { email, password },
      {
        onSuccess: () => {
          // Reset all fields on success

          reset();
        },
        onError: () => {
          // Reset only the password field on error
          reset({ password: '' });
        },
      }
    );
  }

  return isPendingEmail || isPendingGoogle ? (
    <LoaderSpinner />
  ) : (
    <form
      noValidate
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
        {typeof errors?.email?.message === 'string' && (
          <span> {errors.email.message}</span>
        )}
      </div>
      <div className={styles.inputContainer}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password..."
          {...register('password', { required: 'This field is required' })}
        />
        {typeof errors?.password?.message === 'string' && (
          <span> {errors.password.message}</span>
        )}
      </div>

      <div className={styles.authButtonContainer}>
        <button className="btn-default" type="submit">
          Login
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

export default LoginForm;
