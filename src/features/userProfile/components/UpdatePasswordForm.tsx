import { useUpdatePassword } from '@/features/authentication/hooks/useUpdatePassword';
import { Button, Input } from '@nextui-org/react';
import { useForm } from 'react-hook-form';

function UpdatePasswordForm() {
  const { updatePassword } = useUpdatePassword();
  const { register, formState, handleSubmit, getValues } = useForm();
  const { errors } = formState;

  function formSubmit(formData) {
    const { password } = formData;
    if (!password) return;
    updatePassword({ password });
  }

  return (
    <form noValidate onSubmit={handleSubmit(formSubmit)}>
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
      <Button radius="sm" size="lg" type="submit">
        Update Password
      </Button>
    </form>
  );
}

export default UpdatePasswordForm;
