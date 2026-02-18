import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import AllProviders from 'tests/AllProviders';

interface RenderWithRouteProps {
  element: React.ReactElement;
  route: string;
  path: string;
}

export function renderWithRoute({
  element,
  route,
  path,
}: RenderWithRouteProps) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}
