// Style imports
import styles from '../styles/AuthForm.module.css';

// Third party imports
import { useForm } from 'react-hook-form';

// File imports

import { useEmailSignup } from '../hooks/useEmailSignup';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Link } from '@nextui-org/link';
import { useModalContext } from '../../../context/ModalContext';
import { Divider } from '@nextui-org/divider';

function SignupForm() {
  interface FormData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }

  const { register, handleSubmit, reset, getValues, formState } =
    useForm<FormData>();
  const { errors } = formState;

  const { signupEmail, isPending: isPendingEmail } = useEmailSignup();
  const { openModal } = useModalContext();

  function formSubmit(formData: FormData) {
    console.log(formData);
    console.log(formState);
    const { email, password } = formData;
    console.log(email, password);
    if (!email || !password) return;
    signupEmail({ email, password }, { onSettled: () => reset() });
  }
  return isPendingEmail ? (
    <LoaderSpinner />
  ) : (
    <div className={styles.authFormContainer}>
      <header>
        <h2 className={styles.formHeading}>Sign up</h2>
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
            type="text"
            label="Username"
            radius="sm"
            variant="bordered"
            isInvalid={!!errors.username}
            errorMessage={
              errors.username && typeof errors?.username?.message === 'string'
                ? errors.username.message
                : ''
            }
            {...register('username', {
              required: 'This field is required',
              minLength: {
                value: 6,
                message: 'Username must be at least 6 characters',
              },
              maxLength: {
                value: 16,
                message: 'Username cannot be more than 16 characters',
              },
              pattern: {
                value: /^[a-zA-Z0-9]+$/,
                message: 'Username can only consist of letter and numbers',
              },
            })}
          />
          <Divider className={styles.signUpDivider} />
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

          <Input
            className={styles.formInput}
            type="password"
            radius="sm"
            variant="bordered"
            label="Confirm Password"
            id="confirmPassword"
            isInvalid={!!errors.confirmPassword}
            errorMessage={
              errors.confirmPassword &&
              typeof errors?.confirmPassword?.message === 'string'
                ? errors.confirmPassword.message
                : ''
            }
            {...register('confirmPassword', {
              required: 'This field is required',
              validate: (value) =>
                value === getValues().password || 'Passwords need to match',
            })}
          />
        </div>

        <div className={styles.authButtonContainer}>
          <Button
            className={styles.authButton}
            radius="sm"
            size="lg"
            type="submit"
          >
            Confirm Account
          </Button>
        </div>
      </form>
      <footer className={styles.footerContainer}>
        <p>Already have an account?</p>
        <Link underline="hover" size="md" onPress={() => openModal('login')}>
          Login
        </Link>
      </footer>
    </div>
  );
}

export default SignupForm;
