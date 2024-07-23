// Style imports
import { useModalContext } from '@/context/ModalContext';
import styles from '../styles/AuthForm.module.css';

import { Button, Divider, Input, Link } from '@nextui-org/react';
import { useForm } from 'react-hook-form';

function ForgotPasswordForm() {
  const { register, handleSubmit, reset, getValues, formState } = useForm();
  const { openModal } = useModalContext();

  const { errors } = formState;

  function formSubmit(formData) {
    console.log(formData);
  }

  return (
    <div className={styles.authFormContainer}>
      <header>
        <h2 className={styles.formHeading}>Reset Password</h2>
      </header>
      <form
        className={styles.authForm}
        noValidate
        onSubmit={handleSubmit(formSubmit)}
      >
        <div className={styles.authInputContainer}>
          <Input
            id="firstElementToFocus"
            className={styles.formInput}
            type="email"
            label="Email"
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
        </div>
        <div className={styles.authButtonContainer}>
          <Button
            className={styles.authButton}
            radius="sm"
            size="lg"
            type="submit"
          >
            Reset Password
          </Button>
        </div>
      </form>
      <footer className={styles.footerContainer}>
        <p>Oh! I remembered it! Back to - </p>
        <Link underline="hover" size="md" onPress={() => openModal('login')}>
          Login
        </Link>
      </footer>
    </div>
  );
}

export default ForgotPasswordForm;
