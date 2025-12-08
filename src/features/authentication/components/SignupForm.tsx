import { Controller, useForm } from 'react-hook-form';
import { useEmailSignup } from '../hooks/useEmailSignup';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { useModalContext } from '../../../context/ModalContext';
import { Divider } from '@heroui/divider';

function SignupForm() {
  interface FormData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }

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
  const { openModal, closeModal } = useModalContext();

  function formSubmit(formData: FormData) {
    const { email, password } = formData;
    if (!email || !password) return;

    signupEmail(
      { email, password },
      {
        onSettled: () => {
          reset();
          closeModal();
        },
      }
    );
  }

  return (
    <div className="flex w-80 flex-col items-center justify-between gap-10">
      {isPendingEmail && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60">
          <LoaderSpinner />
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
                radius="sm"
                variant="bordered"
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
              <Input
                {...field}
                isDisabled={isPendingEmail}
                className="mb-5"
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
                isDisabled={isPendingEmail}
                className="mb-5"
                type="password"
                radius="sm"
                variant="bordered"
                label="Confirm Password"
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
              />
            )}
          />
        </div>

        <div className="mt-5 flex w-full flex-col items-center gap-2">
          <Button
            isDisabled={isPendingEmail}
            className="w-full"
            radius="sm"
            size="lg"
            type="submit"
          >
            Confirm Account
          </Button>
        </div>
      </form>

      <footer className="mb-5 flex w-full justify-center gap-2">
        <p>Already have an account?</p>
        <Link
          isDisabled={isPendingEmail}
          underline="hover"
          size="md"
          onPress={() => openModal('login')}
        >
          Login
        </Link>
      </footer>
    </div>
  );
}

export default SignupForm;
