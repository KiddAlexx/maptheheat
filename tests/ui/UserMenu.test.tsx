import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserMenu from '@/ui/UserMenu';
import AllProviders from 'tests/AllProviders';
import { getCurrentUserMock } from 'tests/mocks/apiAuth';
import { getIsAdminMock } from 'tests/mocks/apiModeration';

function renderUserMenu() {
  return render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({
      id: 'auth-user-test-id',
      role: 'authenticated',
    });
    getIsAdminMock.mockResolvedValue(false);
  });

  it('shows the Admin item in the dropdown for admin users', async () => {
    const user = userEvent.setup();
    getIsAdminMock.mockResolvedValueOnce(true);

    renderUserMenu();

    await user.click(
      await screen.findByRole('button', { name: /open user menu/i })
    );

    expect(
      await screen.findByRole('menuitem', { name: /admin/i })
    ).toBeInTheDocument();
  });

  it('does not show the Admin item for non-admin users', async () => {
    const user = userEvent.setup();

    renderUserMenu();

    await user.click(
      await screen.findByRole('button', { name: /open user menu/i })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('menuitem', { name: /admin/i })
      ).not.toBeInTheDocument();
    });
  });
});
