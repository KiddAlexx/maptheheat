// Third Party Imports
import { Controller, useForm } from 'react-hook-form';

// React imports

// Hooks
import { useEmailLogin } from '../hooks/useEmailLogin';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { useModalContext } from '@/context/ModalContext';

// Assets
import googleBtnLight from '@/assets/btn_google_light_normal_ios.svg';

// Components
import LoaderSpinner from '@/ui/LoaderSpinner';
import { Input, Link, Button, Divider } from '@heroui/react';

interface FormData {
  email: string;
  password: string;
}

function LoginForm() {
  const {
    control,
    handleSubmit,
    reset,
    resetField,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { loginEmail, isPending: isPendingEmail } = useEmailLogin();
  const { loginGoogle, isPending: isPendingGoogle } = useGoogleLogin();
  const { openModal } = useModalContext();

  const isLoading = isPendingEmail || isPendingGoogle;

  function formSubmit(formData: FormData) {
    const { email, password } = formData;
    if (!email || !password) return;

    loginEmail(
      { email, password },
      {
        onSuccess: () => reset(),
        onError: () => resetField('password'),
      }
    );
  }

  return (
    <div className="flex w-80 flex-col items-center justify-between gap-10">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60">
          <LoaderSpinner />
        </div>
      )}
      <header>
        <h2 className="mt-5 text-3xl font-medium">Login</h2>
      </header>

      <form className="w-full" noValidate onSubmit={handleSubmit(formSubmit)}>
        <div className="flex flex-col items-end">
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'This field is required',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Please provide a valid email address',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                isDisabled={isLoading}
                id="firstElementToFocus"
                className="mb-5"
                type="email"
                label="Email"
                radius="sm"
                variant="bordered"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: 'This field is required' }}
            render={({ field }) => (
              <Input
                {...field}
                isDisabled={isLoading}
                type="password"
                radius="sm"
                variant="bordered"
                label="Password"
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Link
            isDisabled={isLoading}
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
          <Button
            isDisabled={isLoading}
            className="w-full"
            radius="sm"
            size="lg"
            type="submit"
          >
            Login
          </Button>

          <div className="flex w-full items-center justify-center gap-2 overflow-hidden">
            <Divider />
            <p>OR</p>
            <Divider />
          </div>

          <Button
            isDisabled={isLoading}
            className="w-full"
            radius="sm"
            size="lg"
            type="button"
            onPress={() => loginGoogle()}
          >
            <img src={googleBtnLight} alt="" aria-hidden="true" />
            Sign in with Google
          </Button>
        </div>
      </form>

      <footer className="mb-5 flex w-full justify-center gap-2">
        <p>Not a member?</p>
        <Link
          isDisabled={isLoading}
          underline="hover"
          size="md"
          onPress={() => openModal('sign-up')}
        >
          Sign up now
        </Link>
      </footer>
    </div>
  );
}

export default LoginForm;
