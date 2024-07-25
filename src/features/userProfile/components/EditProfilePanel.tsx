import UpdateEmailForm from './UpdateEmailForm';
import UpdatePasswordForm from './UpdatePasswordForm';
import UpdateUsernameForm from './UpdateUsernameForm';

function EditProfilePanel() {
  return (
    <main>
      <UpdateEmailForm />
      <UpdatePasswordForm />
      <UpdateUsernameForm />
    </main>
  );
}

export default EditProfilePanel;
