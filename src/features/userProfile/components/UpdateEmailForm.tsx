import { useUpdateEmail } from '@/features/authentication/hooks/useUpdateEmail';
import { Button, Input } from '@nextui-org/react';
import { useForm } from 'react-hook-form';

function UpdateEmailForm() {
  const { updateEmail } = useUpdateEmail();
  const { register, formState, handleSubmit, getValues } = useForm();
  const { errors } = formState;

  function formSubmit(formData) {
    console.log(formData);
    const { email } = formData;
    if (!email) return;
    updateEmail({ email });
  }

  return (
    <form noValidate onSubmit={handleSubmit(formSubmit)}>
      <Input
        id="email"
        type="email"
        label="New Email"
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
        id="confirmEmail"
        type="email"
        label="Confirm Email"
        radius="sm"
        variant="bordered"
        isInvalid={!!errors.confirmEmail}
        errorMessage={
          errors.confirmEmail &&
          typeof errors?.confirmEmail?.message === 'string'
            ? errors.confirmEmail.message
            : ''
        }
        {...register('confirmEmail', {
          required: 'This field is required',
          validate: (value) =>
            value === getValues().email || 'Email address does not match',
        })}
      />
      <Button radius="sm" size="lg" type="submit">
        Update email address
      </Button>
    </form>
  );
}

export default UpdateEmailForm;
