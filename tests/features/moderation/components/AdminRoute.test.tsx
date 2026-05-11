import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminRoute from '@/features/moderation/components/AdminRoute';
import AllProviders from 'tests/AllProviders';
import { getCurrentUserMock } from 'tests/mocks/apiAuth';
import { getIsAdminMock } from 'tests/mocks/apiModeration';

function renderAdminRoute() {
  return render(
    <MemoryRouter>
      <AdminRoute>
        <div>Admin shell</div>
      </AdminRoute>
    </MemoryRouter>,
    { wrapper: AllProviders }
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({
      id: 'auth-user-test-id',
      role: 'authenticated',
    });
    getIsAdminMock.mockResolvedValue(false);
  });

  it('does not render admin content for unauthenticated users', async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    renderAdminRoute();

    expect(
      await screen.findByRole('heading', { name: /sign in required/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/admin shell/i)).not.toBeInTheDocument();
    expect(getIsAdminMock).not.toHaveBeenCalled();
  });

  it('does not render admin content for authenticated non-admin users', async () => {
    renderAdminRoute();

    expect(
      await screen.findByRole('heading', { name: /access denied/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(/admin shell/i)).not.toBeInTheDocument();
  });

  it('renders admin content for admin users', async () => {
    getIsAdminMock.mockResolvedValueOnce(true);

    renderAdminRoute();

    expect(await screen.findByText(/admin shell/i)).toBeInTheDocument();
  });
});
