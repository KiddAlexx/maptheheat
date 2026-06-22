// Third Party Imports
import { useNavigate, useParams } from 'react-router';

// React imports
import { useState } from 'react';

// Hooks
import { useUser } from '@/features/authentication/hooks/useUser';
import { useGetUserProfile } from '../hooks/useGetUserProfile';
import { useUpdatePrivacySettings } from '../hooks/useUpdatePrivacySettings';

// Components
import { Accordion, AccordionItem, Selection, Switch } from '@heroui/react';
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

  const { user } = useUser();
  const userId = user?.id;
  const { userProfile } = useGetUserProfile(userId);

  const [isPublic, setIsPublic] = useState(userProfile?.isPublic ?? true);
  const [showFavourites, setShowFavourites] = useState(
    userProfile?.showFavourites ?? false
  );

  const { updatePrivacy, isUpdating } = useUpdatePrivacySettings(userId);

  function handleSelectionChange(key: Selection) {
    const currentKey = Array.from(key)[0];
    setSelected(key);
    navigate(`/profile/edit/${currentKey}`, { replace: true });
  }

  function handleIsPublicChange(value: boolean) {
    setIsPublic(value);
    updatePrivacy({ isPublic: value, showFavourites });
  }

  function handleShowFavouritesChange(value: boolean) {
    setShowFavourites(value);
    updatePrivacy({ isPublic, showFavourites: value });
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
        <AccordionItem key="privacy" title="Privacy">
          <div className="flex flex-col gap-4 pb-2">
            <Switch
              isSelected={isPublic}
              onValueChange={handleIsPublicChange}
              isDisabled={isUpdating}
            >
              Public profile
            </Switch>
            <Switch
              isSelected={showFavourites}
              onValueChange={handleShowFavouritesChange}
              isDisabled={isUpdating}
            >
              Show my favourites on my profile
            </Switch>
          </div>
        </AccordionItem>
      </Accordion>
    </main>
  );
}

export default EditProfilePanel;
