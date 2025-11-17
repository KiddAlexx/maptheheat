import { Button } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Link } from 'react-router-dom';

function MapButton() {
  return (
    <Button
      className="ml-auto self-end bg-primary-300 text-sm"
      as={Link}
      radius="sm"
      size="sm"
      startContent={<Icon icon="lucide:map-pinned" />}
      to={`/app/map/`}
    >
      Map
    </Button>
  );
}

export default MapButton;
