// Third Party Imports
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// React imports
import { useState } from 'react';

// Hooks
import { useEmailLogin } from '../hooks/useEmailLogin';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { useModalContext } from '@/context/ModalContext';

// Assets
import googleBtnLight from '@/assets/btn_google_light_normal_ios.svg';
import { Icon } from '@iconify/react/dist/iconify.js';

// Components
import LoaderSpinner from '@/ui/LoaderSpinner';
import { Input, Button, Divider } from '@heroui/react';

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
  const { openModal, closeModal } = useModalContext();

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const isLoading = isPendingEmail || isPendingGoogle;

  function formSubmit(formData: FormData) {
    const { email, password } = formData;
    if (!email || !password) return;

    loginEmail(
      { email, password },
      {
        onSuccess: () => {
          reset();
          closeModal();
        },
        onError: () => {
          resetField('password');
          toast.error(`Provided email or password are incorrect`);
        },
      }
    );
  }

  return (
    <div className="relative flex w-80 flex-col items-center justify-between gap-10">
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
                type={isVisible ? 'text' : 'password'}
                radius="sm"
                variant="bordered"
                label="Password"
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                endContent={
                  <div className="flex h-full items-center">
                    <button
                      aria-label={isVisible ? 'Hide password' : 'Show password'}
                      type="button"
                      onClick={toggleVisibility}
                      className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 "
                    >
                      {isVisible ? (
                        <Icon icon="lucide:eye" width="18" height="18" />
                      ) : (
                        <Icon icon="lucide:eye-off" width="18" height="18" />
                      )}
                    </button>
                  </div>
                }
              />
            )}
          />

          <button
            disabled={isLoading}
            type="button"
            className="mr-2 mt-2 flex items-center rounded-xl p-1 text-sm text-primary-500 underline hover:opacity-80"
            onClick={() => openModal('forgot-password')}
          >
            Forgot Password
          </button>
        </div>

        <div className="mt-3 flex w-full flex-col items-center gap-2">
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
            className="w-full "
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

      <footer className="mb-5 flex w-full items-center justify-center gap-2">
        <p>Not a member?</p>
        <button
          disabled={isLoading}
          type="button"
          className="flex items-center rounded-xl p-1 text-primary-500 underline hover:opacity-80"
          onClick={() => openModal('sign-up')}
        >
          Sign up now
        </button>
      </footer>
    </div>
  );
}

export default LoginForm;
