// Third party imports
import { useForm } from 'react-hook-form';

// File imports

import { useEmailSignup } from '../hooks/useEmailSignup';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { useModalContext } from '../../../context/ModalContext';
import { Divider } from '@heroui/divider';

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
  const { openModal, closeModal } = useModalContext();

  function formSubmit(formData: FormData) {
    console.log(formData);
    console.log(formState);
    const { email, password } = formData;
    console.log(email, password);
    if (!email || !password) return;
    signupEmail(
      { email, password },
      {
        onSettled: () => {
          reset();
          closeModal();
        },
      }
    );
  }
  return isPendingEmail ? (
    <LoaderSpinner />
  ) : (
    <div className="flex min-w-80 flex-col items-center justify-between gap-10">
      <header>
        <h2 className="mt-5 text-3xl font-medium">Sign up</h2>
      </header>
      <form className="w-full" noValidate onSubmit={handleSubmit(formSubmit)}>
        <div className="flex flex-col items-end">
          <Input
            id="firstElementToFocus"
            className="mb-5"
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

          <Divider className="mb-5" />
          <Input
            className="mb-5"
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
            className="mb-5"
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

        <div className="mt-5 flex w-full flex-col items-center gap-2">
          <Button className="w-full" radius="sm" size="lg" type="submit">
            Confirm Account
          </Button>
        </div>
      </form>
      <footer className="mb-5 flex w-full justify-center gap-2">
        <p>Already have an account?</p>
        <Link underline="hover" size="md" onPress={() => openModal('login')}>
          Login
        </Link>
      </footer>
    </div>
  );
}

export default SignupForm;
