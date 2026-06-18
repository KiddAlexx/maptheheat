export const PASSWORD_MIN_LENGTH = 8;

/**
 * Validates a password against composition rules used across the auth forms.
 *
 * Returns `true` when the password is valid, or a user-facing error message
 * describing the first unmet requirement. Any non-alphanumeric character
 * counts as a symbol — no symbols are disallowed.
 */
export function validatePassword(password: string): string | true {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password needs a minimum of ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[^A-Za-z\d]/.test(password)) {
    return 'Password must contain at least one symbol';
  }
  return true;
}
