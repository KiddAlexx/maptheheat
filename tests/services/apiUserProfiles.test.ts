import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.unmock('@/services/apiUserProfiles');

const { deleteAccount } = await vi.importActual<
  typeof import('@/services/apiUserProfiles')
>('@/services/apiUserProfiles');

const supabaseMocks = vi.hoisted(() => ({
  invoke: vi.fn(),
}));

vi.mock('@/services/supabase', () => ({
  supabaseUrl: 'https://example.supabase.co',
  default: {
    functions: {
      invoke: supabaseMocks.invoke,
    },
  },
}));

describe('apiUserProfiles account deletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates account deletion to the authenticated Edge Function', async () => {
    supabaseMocks.invoke.mockResolvedValue({ data: { success: true }, error: null });

    await deleteAccount(true);

    expect(supabaseMocks.invoke).toHaveBeenCalledWith('delete-account', {
      body: { deleteReviews: true },
    });
  });

  it('does not expose backend error details when account deletion fails', async () => {
    supabaseMocks.invoke.mockResolvedValue({
      data: null,
      error: new Error('internal database detail'),
    });

    await expect(deleteAccount(false)).rejects.toThrow(
      'Account deletion failed. Please try again.'
    );
  });
});
