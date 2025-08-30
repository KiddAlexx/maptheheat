import camelcaseKeys from 'camelcase-keys';
import supabase, { supabaseUrl } from './supabase';
import compressImage from '@/utils/compressImage';
import uploadImages from './supabaseImageUploader';
import { UserNotification } from '@/types/userTypes';

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Profile could not be loaded. Error:${error.message}`);
  }
  return camelcaseKeys(data[0]);
}

export async function getUnreadNotificationsCount({
  userId,
}: {
  userId?: string | null;
}) {
  if (!userId) throw new Error('No userId provided');
  const { count, error } = await supabase
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('notification_status', 'unread');

  if (error) {
    throw new Error(`Error fetching notification count: ${error.message}`);
  }

  return count;
}

export interface NotificationsResponse {
  data: UserNotification[];
  /*  count: number | null; */
}

export async function getUserNotifications({
  userId,
}: {
  userId: string;
}): Promise<NotificationsResponse> {
  const { data, error } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .neq('notification_status', 'deleted');

  console.log('heres the notifications', data);

  if (error) {
    throw new Error(`Error fetching notifications: ${error.message}`);
  }
  return { data: camelcaseKeys(data, { deep: true }) };
}

export async function deleteUserNotificationApi({
  notificationId,
}: {
  notificationId: string;
}) {
  const { data, error } = await supabase
    .from('user_notifications')
    .update({ notification_status: 'deleted' })
    .eq('notification_id', notificationId)
    .select();

  if (error) {
    throw new Error(`Error deleting notification ${error.message}`);
  }

  return data;
}
export async function updateUserNotificationApi({
  notificationId,
}: {
  notificationId: string;
}) {
  const { data, error } = await supabase
    .from('user_notifications')
    .update({ notification_status: 'read' })
    .eq('notification_id', notificationId)
    .select();

  if (error) {
    throw new Error(`Error updating notification ${error.message}`);
  }

  return data;
}

export interface UpdateAvatarApiParams {
  newAvatar: File[];
}

export async function updateAvatarApi({ newAvatar }: UpdateAvatarApiParams) {
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError)
    throw new Error(`No authenticated user found: ${authError.message}`);
  const userId = user?.user?.id;
  // Compress image. Type asserted as function will return File or throw an Error
  const compressedAvatar = (await compressImage(newAvatar, {
    maxWidthOrHeight: 150,
  })) as File[];

  // Upload image to supabase bucket
  const imagePath = await uploadImages(compressedAvatar, 'avatars', userId);

  const avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${imagePath}`;

  // Add image path for avatar to profiles table
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Error adding image to database: ${error.message}`);
  }
  console.log('this is the uploaded image data', data);
  return data;
}

export interface UpdateUsernameParams {
  username: string;
}

export async function updateUsernameApi({ username }: UpdateUsernameParams) {
  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError)
    throw new Error(`No authenticated user found: ${authError.message}`);
  const userId = user?.user?.id;
  const { data, error } = await supabase
    .from('profiles')
    .update({ username: username })
    .match({ user_id: userId });
  if (error?.message.includes('profiles_username_key')) {
    throw new Error(`This username is already taken. Please choose another`);
  }
  if (error) throw new Error(`Error updating username: ${error.message}`);
  return data;
}

export interface AddFavouriteVenueParams {
  venueId: string;
  userId: string;
}

export async function updateFavouriteVenue({
  venueId,
  userId,
}: AddFavouriteVenueParams) {
  // Fetch row based on userId + return favourite_venues
  const { data: currentFavs, error: fetchError } = await supabase
    .from('profiles')
    .select('favourite_venues')
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    throw new Error(
      `Error fetching current favourite venues: ${fetchError.message}`
    );
  }

  // Create an empty array when favourite_venues is null
  const currentFavsArray: string[] = currentFavs.favourite_venues || [];

  // Toggle presence of venueId in the favourites array
  const updatedFavs = currentFavsArray.includes(venueId)
    ? currentFavsArray.filter((id) => id !== venueId)
    : [...currentFavsArray, venueId];

  // Update profiles table with new favourite_venues list
  const { data, error } = await supabase
    .from('profiles')
    .update({ favourite_venues: updatedFavs })
    .eq('user_id', userId);

  if (error) {
    throw new Error(
      `Error adding favourite venue to database: ${error.message}`
    );
  }

  return data;
}
