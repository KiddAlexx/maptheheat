import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/apiAuth');

const supabaseMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getUser: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/services/supabase', () => ({
  supabaseUrl: 'https://test-ref.supabase.co',
  default: {
    auth: {
      getSession: supabaseMocks.getSession,
      getUser: supabaseMocks.getUser,
      signOut: supabaseMocks.signOut,
    },
  },
}));

const { clearLocalSessionApi, getCurrentUser } = await vi.importActual<
  typeof import('@/services/apiAuth')
>('@/services/apiAuth');

describe('apiAuth local session cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('clears the local Supabase session when the deleted auth user no longer exists', async () => {
    const deletedUserError = new Error(
      'User from sub claim in JWT does not exist'
    );
    supabaseMocks.signOut.mockResolvedValue({ error: deletedUserError });
    window.localStorage.setItem('sb-test-ref-auth-token', 'stale-session');
    window.localStorage.setItem(
      'sb-test-ref-auth-token-code-verifier',
      'stale-code-verifier'
    );

    await expect(clearLocalSessionApi()).resolves.toBeUndefined();

    expect(supabaseMocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(window.localStorage.getItem('sb-test-ref-auth-token')).toBeNull();
    expect(
      window.localStorage.getItem('sb-test-ref-auth-token-code-verifier')
    ).toBeNull();
  });

  it('still reports unexpected local sign-out errors', async () => {
    supabaseMocks.signOut.mockResolvedValue({
      error: new Error('network unavailable'),
    });

    await expect(clearLocalSessionApi()).rejects.toThrow(
      'unable to clear local session network unavailable'
    );
  });

  it('clears stale auth state when the current user was already deleted', async () => {
    supabaseMocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'stale-token' } },
    });
    supabaseMocks.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('User from sub claim in JWT does not exist'),
    });
    window.localStorage.setItem('sb-test-ref-auth-token', 'stale-session');

    await expect(getCurrentUser()).resolves.toBeNull();

    expect(window.localStorage.getItem('sb-test-ref-auth-token')).toBeNull();
  });
});
