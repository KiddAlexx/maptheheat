import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSessionApiMock } from 'tests/mocks/apiAuth';
import { deleteAccountMock } from 'tests/mocks/apiUserProfiles';
import { useDeleteAccount } from '@/features/userProfile/hooks/useDeleteAccount';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigateMock,
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useDeleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears cached auth state and navigates home even when local session cleanup reports a deleted user', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(['user'], {
      id: 'deleted-user-id',
      role: 'authenticated',
    });
    deleteAccountMock.mockResolvedValue(undefined);
    clearLocalSessionApiMock.mockRejectedValue(
      new Error('unable to clear local session User from sub claim in JWT does not exist')
    );
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useDeleteAccount(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.triggerDeleteAccount(false);
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
    });

    expect(deleteAccountMock).toHaveBeenCalledWith(false);
    expect(clearLocalSessionApiMock).toHaveBeenCalled();
    expect(queryClient.getQueryData(['user'])).toBeUndefined();

    consoleErrorSpy.mockRestore();
  });
});
