// Third Party Imports
import { Controller, useForm } from 'react-hook-form';

// Hooks
import { useModalContext } from '@/context/ModalContext';
import { useRecoverPassword } from '../hooks/useRecoverPassword';
import { useGlobalError } from '@/context/ErrorContext';

// Components
import { Button, Input } from '@heroui/react';
import LoaderSpinner from '@/ui/LoaderSpinner';

interface FormData {
  email: string;
}

function ForgotPasswordForm() {
  const { control, handleSubmit, formState } = useForm<FormData>();
  const { errors } = formState;

  const { openModal, openDialog } = useModalContext();
  const { setGlobalError } = useGlobalError();
  const { recoverPassword, isPending } = useRecoverPassword();

  function formSubmit(formData: FormData) {
    const { email } = formData;
    if (!email) return;
    recoverPassword(
      { email },
      {
        onSuccess: () => {
          openDialog(
            'If that email address is in our system, we will send a link to reset your password'
          );
        },
        onError: () => {
          setGlobalError(
            'There was an error resetting your password. Please confirm your email address and try again'
          );
        },
      }
    );
  }

  return (
    <div className="relative flex w-80 flex-col items-center justify-between gap-8">
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60">
          <LoaderSpinner />
        </div>
      )}
      <header>
        <h2 className="mt-5 text-3xl font-medium">Reset Password</h2>
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
                id="firstElementToFocus"
                type="email"
                label="Email"
                radius="sm"
                variant="bordered"
                isInvalid={!!errors.email}
                errorMessage={errors?.email?.message}
              />
            )}
          />
        </div>

        <div className="mt-6">
          <Button
            isDisabled={isPending}
            className="w-full"
            radius="sm"
            size="lg"
            type="submit"
          >
            Reset Password
          </Button>
        </div>
      </form>

      <footer className="mb-2 flex items-center gap-2">
        <p>Oh! I remembered it!</p>
        <button
          disabled={isPending}
          type="button"
          className="flex items-center rounded-xl p-1 text-primary-500 underline hover:opacity-80"
          onClick={() => openModal('login')}
        >
          Back to Login
        </button>
      </footer>
    </div>
  );
}

export default ForgotPasswordForm;
