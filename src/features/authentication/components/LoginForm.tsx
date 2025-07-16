// NextUI Components
import { Input, Link, Button, Divider } from '@heroui/react';

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
    <div className="flex min-w-80 flex-col items-center justify-between gap-10">
      <header>
        <h2 className="mt-5 text-3xl font-medium">Login</h2>
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

          <Link
            className="mr-2 mt-2"
            underline="hover"
            size="sm"
            color="foreground"
            onPress={() => openModal('forgot-password')}
          >
            Forgot Password
          </Link>
        </div>

        <div className="mt-5 flex w-full flex-col items-center gap-2">
          <Button className="w-full" radius="sm" size="lg" type="submit">
            Login
          </Button>
          <div className="flex w-full items-center justify-center  gap-2 overflow-hidden">
            <Divider />
            <p>OR</p>
            <Divider />
          </div>

          <Button
            className="w-full"
            radius="sm"
            size="lg"
            type="button"
            onPress={() => loginGoogle()}
          >
            <img src={googleBtnLight} alt="Google logo" />
            Sign In With Google
          </Button>
        </div>
      </form>
      <footer className="mb-5 flex w-full justify-center gap-2">
        <p>Not a member?</p>
        <Link underline="hover" size="md" onPress={() => openModal('sign-up')}>
          Sign up now
        </Link>
      </footer>
    </div>
  );
}

export default LoginForm;
