import { vi } from 'vitest';

type MockAuthUser = {
  id: string;
  role: string;
};

/*  aud: "authenticated"
confirmed_at: "2025-11-18T14:26:43.93432Z"
created_at: "2025-11-18T14:26:43.916587Z"
email: "kiddalexxcodes@gmail.com"
email_confirmed_at: "2025-11-18T14:26:43.93432Z"
id: "fe45aa69-5edc-4d97-9df3-c2cf258ddb1e"
identities: Array [ {…} ]""
is_anonymous: false"
last_sign_in_at: "2026-02-11T15:47:46.616081Z"
 phone: ""
role: "authenticated"
updated_at: "2026-02-13T08:06:32.564859Z"  */

export const getCurrentUserMock = vi.fn<() => Promise<MockAuthUser | null>>(
  async () => {
  const user = {
    id: 'auth-user-test-id',
    role: 'authenticated',
  };
  return user;
  }
);
