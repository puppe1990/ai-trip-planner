import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signOutAndRedirect } from './auth-actions';

const signOutMock = vi.fn();

vi.mock('./auth-client', () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

describe('signOutAndRedirect', () => {
  const navigate = vi.fn();
  const invalidate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    navigate.mockResolvedValue(undefined);
    invalidate.mockResolvedValue(undefined);
  });

  it('signs out and redirects to login on success', async () => {
    signOutMock.mockResolvedValue({ data: { success: true }, error: null });

    await signOutAndRedirect({ navigate, invalidate });

    expect(signOutMock).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith({ to: '/login' });
  });

  it('does not redirect when sign out fails', async () => {
    signOutMock.mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });

    await expect(signOutAndRedirect({ navigate, invalidate })).rejects.toThrow('Network error');

    expect(invalidate).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
