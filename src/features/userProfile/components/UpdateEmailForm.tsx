import { useUpdateEmail } from '@/features/authentication/hooks/useUpdateEmail';
import { Button, Input } from '@heroui/react';
import { Controller, useForm } from 'react-hook-form';

function UpdateEmailForm() {
  interface FormData {
    email: string;
    confirmEmail: string;
  }

  const { updateEmail } = useUpdateEmail();
  const { control, formState, handleSubmit, getValues, reset } =
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
            id="email"
            type="email"
            label="Email" radius="full"
            variant="bordered"
            isInvalid={!!errors.email}
            errorMessage={errors?.email?.message}
          />
        )}
      />
      <Controller
        name="confirmEmail"
        control={control}
        rules={{
          required: 'This field is required',
          validate: (value) =>
            value === getValues().email || 'Email address does not match',
        }}
        render={({ field }) => (
          <Input
            {...field}
            className="mt-2"
            id="confirmEmail"
            type="email"
            label="Confirm Email" radius="full"
            variant="bordered"
            isInvalid={!!errors.confirmEmail}
            errorMessage={
              errors.confirmEmail &&
              typeof errors?.confirmEmail?.message === 'string'
                ? errors.confirmEmail.message
                : ''
            }
          />
        )}
      />

      <div className="mt-2 flex justify-end">
        <Button radius="full" size="md" type="submit">
          Update Email
        </Button>
      </div>
    </form>
  );
}

export default UpdateEmailForm;
