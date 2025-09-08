import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { Button } from '@heroui/react';
import {
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from 'react-share';
import { Icon } from '@iconify/react/dist/iconify.js';

interface ShareButtonProps {
  shareUrl: string;
  title: string;
}

function ShareButton({ shareUrl, title }: ShareButtonProps) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          radius="none"
          className="h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
          isIconOnly
          disableAnimation
        >
          <Icon
            className="text-slate-700"
            icon="ri:share-fill"
            width="20"
            height="20"
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="facebook">
          <FacebookMessengerShareButton
            className="flex w-full gap-2"
            url={shareUrl}
            appId={import.meta.env.VITE_PUBLIC_FB_APP_ID!}
          >
            <FacebookMessengerIcon size={20} round />
            FB Messenger
          </FacebookMessengerShareButton>
        </DropdownItem>
        <DropdownItem key="whatsapp">
          <WhatsappShareButton
            className="flex w-full gap-2"
            url={shareUrl}
            title={title}
            separator=":: "
          >
            <WhatsappIcon size={20} round />
            Whatsapp
          </WhatsappShareButton>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default ShareButton;
