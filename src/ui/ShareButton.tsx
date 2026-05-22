// Third Party Imports
import {
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  WhatsappShareButton,
  WhatsappIcon,
  EmailShareButton,
  EmailIcon,
} from 'react-share';
import toast from 'react-hot-toast';

// Assets
import { Icon } from '@iconify/react/dist/iconify.js';

// Components
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from '@heroui/dropdown';
import { Button } from '@heroui/react';

interface ShareButtonProps {
  shareUrl: string;
  title: string;
  body: string;
}

function ShareButton({ shareUrl, title, body }: ShareButtonProps) {
  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Link not copied, please try again!');
    }
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          radius="full"
          className="h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
          isIconOnly
          disableAnimation
          aria-label="Share venue"
        >
          <Icon
            className="text-slate-700 dark:text-zinc-200"
            icon="ri:share-fill"
            width="20"
            height="20"
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownSection showDivider>
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
          <DropdownItem key="email">
            <EmailShareButton
              className="flex w-full gap-2"
              url={shareUrl}
              subject={title}
              body={body}
            >
              <EmailIcon size={20} round />
              Email
            </EmailShareButton>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem key="copy">
            <Button
              radius="full"
              className="flex h-auto w-auto bg-transparent"
              disableAnimation
              onPress={() => copyLink(shareUrl)}
            >
              <Icon
                className="mr-1 text-slate-600"
                icon="uil:copy"
                width="22"
                height="22"
              />
              Copy Link
            </Button>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}

export default ShareButton;
