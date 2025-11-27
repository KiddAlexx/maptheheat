import { Button } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { Link, NavLink } from 'react-router-dom';

function MapButton() {
  return (
    <NavLink
      to="/app/map"
      className="text-xl font-medium text-primary-50 transition-colors hover:text-primary-300"
    >
      Map
    </NavLink>
  );
}

export default MapButton;
