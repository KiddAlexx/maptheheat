import supabase from './supabase';

export async function signupApi({ email, password }) {
  console.log(email, password);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw new Error(`Account could not be created ${error.message}`);

  return data;
}

export async function loginApi({ email, password }) {
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

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error)
    throw new Error(`unable to retrieve current user ${error.message}`);
  return data?.user;
}
