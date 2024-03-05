// Style imports
import styles from './AuthForm.module.css';

// NextUI Components
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Link } from '@nextui-org/link';

// File imports
import googleBtnLight from '../../assets/btn_google_light_normal_ios.svg';
import { useForm } from 'react-hook-form';
import { useEmailLogin } from './useEmailLogin';
import { useGoogleLogin } from './useGoogleLogin';
import LoaderSpinner from '../../ui/LoaderSpinner';
import { useModalContext } from '../../context/ModalContext';

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
    <div>
      <header>
        <h2>Login</h2>
      </header>
      <form
        noValidate
        onSubmit={handleSubmit(formSubmit)}
        className={styles.authFormContainer}
      >
        <div className={styles.inputContainer}>
          <Input
            type="email"
            radius="sm"
            variant="bordered"
            label="Email"
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
          <Link color="foreground" underline="hover">
            Forgot Password
          </Link>
        </div>
        <div className={styles.authButtonContainer}>
          <Button className="w-full" radius="sm" size="lg" type="submit">
            Login
          </Button>
          <Button
            className="w-full"
            radius="sm"
            size="lg"
            type="button"
            onClick={() => loginGoogle()}
          >
            <img src={googleBtnLight} alt="Google logo" />
            Sign In With Google
          </Button>

          <p>Not a member?</p>
          <Link underline="hover" onPress={() => openModal('sign-up')}>
            Sign up now
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
