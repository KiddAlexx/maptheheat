// Style imports
import styles from '../styles/AuthForm.module.css';

// NextUI Components
import { Input, Link, Button, Divider } from '@nextui-org/react';

// File imports
import googleBtnLight from '../../../assets/btn_google_light_normal_ios.svg';
import { useForm } from 'react-hook-form';
import { useEmailLogin } from '../hooks/useEmailLogin';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { useModalContext } from '@/context/ModalContext';
import LoaderSpinner from '@/ui/LoaderSpinner';

function LoginForm() {
  interface FormData {
    email: string;
    password: string;
  }

  const { register, handleSubmit, reset, formState } = useForm<FormData>();
  const { errors } = formState;

  const { loginEmail, isPending: isPendingEmail } = useEmailLogin();
  const { loginGoogle, isPending: isPendingGoogle } = useGoogleLogin();
  const { openModal } = useModalContext();

  function formSubmit(formData: FormData) {
    console.log(formData);
    console.log(formState);
    const { email, password } = formData;

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
    <div className={styles.authFormContainer}>
      <header>
        <h2 className={styles.formHeading}>Login</h2>
      </header>
      <form
        className={styles.authForm}
        noValidate
        onSubmit={handleSubmit(formSubmit)}
      >
        <div className={styles.authInputContainer}>
          <Input
            id="firstElementToFocus"
            className={styles.formInput}
            type="email"
            label="Email"
            radius="sm"
            variant="bordered"
            isInvalid={!!errors.email}
            errorMessage={
              errors.email && typeof errors?.email?.message === 'string'
                ? errors.email.message
                : ''
            }
            {...register('email', {
              required: 'This field is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Please provide a valid email address',
              },
            })}
          />

          <Input
            className={styles.formInput}
            type="password"
            radius="sm"
            variant="bordered"
            label="Password"
            isInvalid={!!errors.password}
            errorMessage={
              errors.password && typeof errors?.password?.message === 'string'
                ? errors.password.message
                : ''
            }
            {...register('password', { required: 'This field is required' })}
          />

          <Link
            className={styles.forgotPasswordLink}
            underline="hover"
            size="sm"
            color="foreground"
          >
            Forgot Password
          </Link>
        </div>

        <div className={styles.authButtonContainer}>
          <Button
            className={styles.authButton}
            radius="sm"
            size="lg"
            type="submit"
          >
            Login
          </Button>
          <div className={styles.dividerContainer}>
            <Divider />
            <p>OR</p>
            <Divider />
          </div>

          <Button
            className={styles.authButton}
            radius="sm"
            size="lg"
            type="button"
            onClick={() => loginGoogle()}
          >
            <img src={googleBtnLight} alt="Google logo" />
            Sign In With Google
          </Button>
        </div>
      </form>
      <footer className={styles.footerContainer}>
        <p>Not a member?</p>
        <Link underline="hover" size="md" onPress={() => openModal('sign-up')}>
          Sign up now
        </Link>
      </footer>
    </div>
  );
}

export default LoginForm;
