import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { Button } from '@heroui/react';
import { FacebookMessengerShareButton } from 'react-share';
import { Icon } from '@iconify/react/dist/iconify.js';

interface ShareButtonProps {
  shareUrl: string;
}

function ShareButton({ shareUrl }: ShareButtonProps) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          radius="none"
          className="h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
          isIconOnly
          disableAnimation
        >
          <Icon icon="ri:share-fill" width="20" height="20" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="facebook">
          <FacebookMessengerShareButton
            className="flex w-full gap-2"
            url={shareUrl}
            appId={import.meta.env.VITE_PUBLIC_FB_APP_ID!}
          >
            <Icon
              className="text-[#1877F2]"
              icon="fa6-brands:facebook-messenger"
              width="20"
              height="20"
            />
            FB Messenger
          </FacebookMessengerShareButton>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default ShareButton;
