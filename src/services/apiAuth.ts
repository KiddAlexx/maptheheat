import { AuthCredentials, Email, Password } from '../types/authenticationTypes';
import supabase, { supabaseUrl } from './supabase';

function getSupabaseAuthStorageKey(): string | null {
  if (!supabaseUrl) return null;

  try {
    return `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  } catch {
    return null;
  }
}

function removeLocalSupabaseAuthSession(): void {
  const storageKey = getSupabaseAuthStorageKey();
  if (!storageKey || typeof window === 'undefined') return;

  window.localStorage.removeItem(storageKey);
  window.localStorage.removeItem(`${storageKey}-code-verifier`);
}

function isDeletedAuthUserError(error: Error): boolean {
  return error.message.includes('User from sub claim in JWT does not exist');
}

export async function signupApi({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw new Error(`Account could not be created ${error.message}`);

  return data;
}

export async function loginApi({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error)
    throw new Error(
      `unable to login in, please check credentials ${error.message}`
    );
  return data;
}

export async function loginGoogleApi() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href,
    },
  });
  if (error) throw new Error(`Google sign in failed:  ${error.message}`);
  return data;
}

export async function updateEmailApi({ email }: Email) {
  const { data, error } = await supabase.auth.updateUser({
    email,
  });
  if (error) throw new Error(`Email update failed: ${error.message}`);
  return data;
}

export async function updatePasswordApi({ password }: Password) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  if (error) throw new Error(`Password update failed: ${error.message}`);
  return data;
}

export async function recoverPasswordApi({ email }: Email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });
  if (error) throw new Error(`Password recovery failed: ${error.message}`);

  return data;
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    removeLocalSupabaseAuthSession();
    if (isDeletedAuthUserError(error)) return null;

    throw new Error(`unable to retrieve current user ${error.message}`);
  }
  return data?.user;
}

export async function logoutApi() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`unable to logout ${error.message}`);
}

export async function clearLocalSessionApi() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (!error) return;

  removeLocalSupabaseAuthSession();
  if (isDeletedAuthUserError(error)) return;

  throw new Error(`unable to clear local session ${error.message}`);
}
