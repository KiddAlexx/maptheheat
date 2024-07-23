import { AuthCredentials } from '../types/authenticationTypes';
import supabase from './supabase';

export async function signupApi({ email, password }: AuthCredentials) {
  console.log(email, password);
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
      redirectTo: 'http://localhost:5173/app/map',
    },
  });
  if (error) throw new Error(`Google sign in failed:  ${error.message}`);
  return data;
}

export async function updateEmailApi({ email }) {
  const { data, error } = await supabase.auth.updateUser({
    email,
  });
  if (error) throw new Error(`Email update failed: ${error.message}`);
  return data;
}
export async function updatePasswordApi({ password }) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  if (error) throw new Error(`Password update failed: ${error.message}`);
  return data;
}

export async function recoverPasswordApi({ email }) {
  const { data, error } = await supabase.auth.resetPasswordForEmail({ email });
  if (error) throw new Error(`Password recovery failed: ${error.message}`);
  return data;
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error)
    throw new Error(`unable to retrieve current user ${error.message}`);
  return data?.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`unable to logout ${error.message}`);
}
