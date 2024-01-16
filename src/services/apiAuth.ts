import supabase from './supabase';

export async function signup({ email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw new Error(`Account could not be created ${error.message}`);
  return data;
}
