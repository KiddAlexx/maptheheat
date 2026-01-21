// Third Party Imports
import { Controller, useForm } from 'react-hook-form';

// Hooks
import { useModalContext } from '@/context/ModalContext';
import { useRecoverPassword } from '../hooks/useRecoverPassword';
import { useGlobalError } from '@/context/ErrorContext';

// Components
import { Button, Input, Link } from '@heroui/react';

interface FormData {
  email: string;
}

function ForgotPasswordForm() {
  const { control, handleSubmit, formState } = useForm<FormData>();
  const { errors } = formState;

  const { openModal, openDialog } = useModalContext();
  const { setGlobalError } = useGlobalError();
  const { recoverPassword } = useRecoverPassword();

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
    <div className="flex w-80 flex-col items-center justify-between gap-10">
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
          <Button className="w-full" radius="sm" size="lg" type="submit">
            Reset Password
          </Button>
        </div>
      </form>

      <footer className="mb-2 flex gap-2">
        <p>Oh! I remembered it!</p>
        <Link underline="hover" size="md" onPress={() => openModal('login')}>
          Back to Login
        </Link>
      </footer>
    </div>
  );
}

export default ForgotPasswordForm;
