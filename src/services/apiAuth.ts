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
