import { Button, Input } from "@heroui/react";
import { useForm } from 'react-hook-form';
import { useUpdateUsername } from '../hooks/useUpdateUsername';

function UpdateUsernameForm() {
  const { register, formState, handleSubmit, getValues, reset } = useForm();
  const { errors } = formState;
  const { updateUsername } = useUpdateUsername();

  function formSubmit(formData) {
    const { username } = formData;
    if (!username) return;
    updateUsername({ username }, { onSuccess: () => reset() });
  }

  return (
    <form noValidate onSubmit={handleSubmit(formSubmit)}>
      <Input
        id="username"
        type="text"
        label="New Username"
        radius="sm"
        variant="bordered"
        isInvalid={!!errors.username}
        errorMessage={
          errors.username && typeof errors?.username?.message === 'string'
            ? errors.username.message
            : ''
        }
        {...register('username', {
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
        })}
      />
      <Button radius="sm" size="lg" type="submit">
        Update Username
      </Button>
    </form>
  );
}

export default UpdateUsernameForm;
