import { useUpdateEmail } from '@/features/authentication/hooks/useUpdateEmail';
import { Button, Input } from '@heroui/react';
import { useForm } from 'react-hook-form';

function UpdateEmailForm() {
  interface FormData {
    email: string;
    confirmEmail: string;
  }

  const { updateEmail } = useUpdateEmail();
  const { register, formState, handleSubmit, getValues, reset } =
    useForm<FormData>();
  const { errors } = formState;

  function formSubmit(formData: FormData) {
    const { email } = formData;
    if (!email) return;
    updateEmail({ email }, { onSuccess: () => reset() });
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(formSubmit)}
      className="w-full max-w-3xl"
    >
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
        className="mt-2"
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
      <div className="mt-2 flex justify-end">
        <Button radius="sm" size="md" type="submit">
          Update Email
        </Button>
      </div>
    </form>
  );
}

export default UpdateEmailForm;
