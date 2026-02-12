// Third Party Imports
import { useNavigate, useParams } from 'react-router';

// React imports
import { useState } from 'react';

// Components
import { Accordion, AccordionItem, Selection } from '@heroui/react';
import UpdateAvatar from './UpdateAvatar';
import UpdateEmailForm from './UpdateEmailForm';
import UpdatePasswordForm from './UpdatePasswordForm';
import UpdateUsernameForm from './UpdateUsernameForm';

function EditProfilePanel() {
  const { setting } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Selection>(
    new Set([setting ?? 'none'])
  );

  function handleSelectionChange(key: Selection) {
    const currentKey = Array.from(key)[0];
    setSelected(key);
    navigate(`/profile/edit/${currentKey}`, { replace: true });
  }

  return (
    <main>
      <Accordion
        selectedKeys={selected}
        onSelectionChange={handleSelectionChange}
      >
        <AccordionItem key="email" title="Update Email">
          <UpdateEmailForm />
        </AccordionItem>
        <AccordionItem key="password" title="Update Password">
          <UpdatePasswordForm />
        </AccordionItem>
        <AccordionItem key="username" title="Update Username">
          <UpdateUsernameForm />
        </AccordionItem>
        <AccordionItem key="avatar" title="Update Avatar">
          <UpdateAvatar />
        </AccordionItem>
      </Accordion>
    </main>
  );
}

export default EditProfilePanel;
