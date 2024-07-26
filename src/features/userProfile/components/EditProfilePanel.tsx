import UpdateAvatar from './UpdateAvatar';
import UpdateEmailForm from './UpdateEmailForm';
import UpdatePasswordForm from './UpdatePasswordForm';
import UpdateUsernameForm from './UpdateUsernameForm';

function EditProfilePanel() {
  return (
    <main>
      <UpdateEmailForm />
      <UpdatePasswordForm />
      <UpdateUsernameForm />
      <UpdateAvatar />
    </main>
  );
}

export default EditProfilePanel;
