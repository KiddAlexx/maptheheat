import supabase from './supabase';

export async function getIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');

  if (error) {
    throw new Error(`Admin access could not be verified. Error: ${error.message}`);
  }

  return Boolean(data);
}
