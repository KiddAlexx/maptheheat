import { useModalContext } from '@/context/ModalContext';
import { useLogout } from '@/features/authentication/hooks/useLogout';
import { useUpdatePassword } from '@/features/authentication/hooks/useUpdatePassword';
import { Button, Input } from '@heroui/react';
import { Controller, useForm } from 'react-hook-form';

function UpdatePasswordForm() {
  interface FormData {
    password: string;
    confirmPassword: string;
  }

  const { updatePassword } = useUpdatePassword();
  const { logout } = useLogout();
  const { openModal } = useModalContext();

  const { control, formState, handleSubmit, getValues } = useForm<FormData>();
  const { errors } = formState;

  function formSubmit(formData: FormData) {
    const { password } = formData;
    if (!password) return;
    updatePassword(
      { password },
      {
        onSuccess: () => {
          logout();
          openModal('login');
        },
      }
    );
  }

  return (
    <form
      className="w-full max-w-3xl"
      noValidate
      onSubmit={handleSubmit(formSubmit)}
    >
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
          <Input
            {...field}
            type="password"
            radius="sm"
            variant="bordered"
            label="Password"
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
          />
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
            className="mt-2"
            type="password"
            radius="sm"
            variant="bordered"
            label="Confirm Password"
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
          />
        )}
      />
      <div className="mt-2 flex justify-end">
        <Button radius="sm" size="md" type="submit">
          Update Password
        </Button>
      </div>
    </form>
  );
}

export default UpdatePasswordForm;
