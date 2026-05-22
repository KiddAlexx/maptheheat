// Third Party Imports
import { Controller, useForm } from 'react-hook-form';

// Hooks
import { useEmailSignup } from '../hooks/useEmailSignup';
import { useModalContext } from '@/context/ModalContext';
import { useGlobalError } from '@/context/ErrorContext';

// React imports
import { useState } from 'react';

// Assets
import { Icon } from '@iconify/react/dist/iconify.js';

// Components
import { Input, Button, Divider } from '@heroui/react';
import LoaderSpinner from '@/ui/LoaderSpinner';

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

function SignupForm() {
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { signupEmail, isPending: isPendingEmail } = useEmailSignup();
  const { openModal, openDialog } = useModalContext();

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { setGlobalError } = useGlobalError();

  function formSubmit(formData: FormData) {
    const { email, password } = formData;
    if (!email || !password) return;

    signupEmail(
      { email, password },
      {
        onSuccess: () => {
          openDialog(
            'Account successfully created! Please check your emails and verify your account'
          );
          reset();
        },
        onError: (err) => {
          setGlobalError(err.message);
        },
      }
    );
  }

  return (
    <div className="relative flex w-80 flex-col items-center justify-between gap-10">
      {isPendingEmail && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60">
          <LoaderSpinner message="Sign up in progress" />
        </div>
      )}
      <header>
        <h2 className="mt-5 text-3xl font-medium">Sign up</h2>
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
                isDisabled={isPendingEmail}
                id="firstElementToFocus"
                className="mb-5"
                type="email"
                label="Email"
                radius="full"
                variant="bordered"
                autoComplete="email"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Divider className="mb-5" />

          <Controller
            name="password"
            control={control}
            rules={{
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
            }}
            render={({ field }) => (
              <>
                <Input
                  {...field}
                  isDisabled={isPendingEmail}
                  className={
                    isPasswordFocused && !errors.password ? 'mb-1' : 'mb-5'
                  }
                  type={isVisible ? 'text' : 'password'}
                  radius="full"
                  variant="bordered"
                  label="Password"
                  autoComplete="new-password"
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => {
                    field.onBlur();
                    setIsPasswordFocused(false);
                  }}
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                  endContent={
                    <div className="flex h-full items-center">
                      <button
                        aria-label={
                          isVisible ? 'Hide password' : 'Show password'
                        }
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
                {isPasswordFocused && !errors.password && (
                  <p className="mb-5 ml-3 mt-1 text-xs text-zinc-500 dark:text-zinc-300">
                    At least 8 characters including an uppercase letter, a
                    number and a symbol (@$!%*?&)
                  </p>
                )}
              </>
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: 'This field is required',
              validate: (value) =>
                value === getValues().password || 'Passwords need to match',
            }}
            render={({ field }) => (
              <Input
                {...field}
                isDisabled={isPendingEmail}
                className="mb-5"
                type={isVisible ? 'text' : 'password'}
                radius="full"
                variant="bordered"
                label="Confirm Password"
                autoComplete="new-password"
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
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
        </div>

        <div className="mt-5 flex w-full flex-col items-center gap-2">
          <Button
            isDisabled={isPendingEmail}
            className="w-full"
            radius="full"
            size="lg"
            type="submit"
          >
            Create Account
          </Button>
        </div>
      </form>

      <footer className="mb-5 flex w-full items-center justify-center gap-2 ">
        <p>Already have an account?</p>
        <button
          disabled={isPendingEmail}
          type="button"
          className="flex items-center rounded-xl p-1 text-app-link underline hover:opacity-80"
          onClick={() => openModal('login')}
        >
          Login
        </button>
      </footer>
    </div>
  );
}

export default SignupForm;
