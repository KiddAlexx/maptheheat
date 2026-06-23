import ActionButton from '@/ui/ActionButton';
import { Input } from '@heroui/react';
import { Controller, useForm } from 'react-hook-form';
import { useUpdateUsername } from '../hooks/useUpdateUsername';

interface UpdateUsernameFormProps {
  onSuccess?: () => void;
}

function UpdateUsernameForm({ onSuccess }: UpdateUsernameFormProps) {
  interface FormData {
    username: string;
  }

  const { control, formState, handleSubmit, reset } = useForm<FormData>();
  const { errors } = formState;
  const { updateUsername } = useUpdateUsername();

  function formSubmit(formData: FormData) {
    const { username } = formData;
    if (!username) return;
    updateUsername({ username }, { onSuccess: () => { reset(); onSuccess?.(); } });
  }

  return (
    <form
      className="w-full max-w-3xl"
      noValidate
      onSubmit={handleSubmit(formSubmit)}
    >
      <Controller
        name="username"
        control={control}
        rules={{
          required: 'This field is required',
          minLength: {
            value: 6,
            message: 'Username must be at least 6 characters',
          },
          maxLength: {
            value: 20,
            message: 'Username cannot be more than 20 characters',
          },
          pattern: {
            value: /^[a-zA-Z0-9]+$/,
            message: 'Username can only consist of letter and numbers',
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            id="username"
            type="text"
            label="New Username" radius="full"
            variant="bordered"
            isInvalid={!!errors.username}
            errorMessage={
              errors.username && typeof errors?.username?.message === 'string'
                ? errors.username.message
                : ''
            }
          />
        )}
      />
      <div className="mt-2 flex justify-end">
        <ActionButton intent="confirm" size="md" type="submit">
          Update Username
        </ActionButton>
      </div>
    </form>
  );
}

export default UpdateUsernameForm;
